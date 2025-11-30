import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MovieService } from './movie.service';

@Controller('movie')
export class MovieController {
  constructor(
    private readonly movieService: MovieService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async getMovies(
    @Query('movieName') movieName: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('mediaType') mediaType?: 'movie' | 'tv',
    @Query('year') year?: string,
  ) {
    if (!movieName) {
      throw new BadRequestException('movieName query param is required');
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const yearNumber = year ? parseInt(year, 10) : undefined;

    const { data, total, totalWatchTime } = await this.movieService.getMovies(
      movieName,
      this.configService,
      pageNumber,
      limitNumber,
      mediaType,
      yearNumber,
    );

    return {
      success: true,
      page: pageNumber,
      limit: limitNumber,
      total,
      totalWatchTime,
      data,
    };
  }
}
