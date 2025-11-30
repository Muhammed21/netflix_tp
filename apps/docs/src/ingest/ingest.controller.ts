import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IngestService } from './ingest.service';
import { parse } from 'csv-parse/sync';
import { CleanAndProcessDataDto } from '@netflix/types';
import { ConfigService } from '@nestjs/config';

@Controller('ingest')
export class IngestController {
  constructor(
    private readonly ingestService: IngestService,
    private readonly configService: ConfigService,
  ) {}

  @Post('csv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const csvContent = file.buffer.toString('utf-8');

    try {
      const records = parse(csvContent, {
        columns: (header) =>
          header.map((column: string) => this.normalizeHeader(column)),
        skip_empty_lines: true,
        trim: true,
        delimiter: ';',
        relax_quotes: true,
        relax_column_count: true,
      }) as unknown as CleanAndProcessDataDto[];

      const cleanData = await this.ingestService.cleanAndProcessData(
        records,
        this.configService,
      );

      await this.ingestService.insertMany(cleanData, this.configService);

      return { success: true, inserted: records.length };
    } catch (error) {
      console.error('CSV parsing error:', error);
      throw new BadRequestException(
        `Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private normalizeHeader(header: string): string {
    return header
      .trim()
      .replace(/\s+(.)/g, (_: string, char: string) => char.toUpperCase())
      .replace(/^(.)/, (_: string, char: string) => char.toLowerCase());
  }
}
