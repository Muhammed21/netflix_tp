import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Get('watched')
  async getWatchedMovies(
    @Query('profileName') profileName: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('mediaType') mediaType?: 'movie' | 'tv',
    @Query('year') year?: string,
  ) {
    if (!profileName) {
      throw new BadRequestException('profileName query param is required');
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const yearNumber = year ? parseInt(year, 10) : undefined;

    const { data, total, totalWatchTime } =
      await this.userService.getWatchedMovies(
        profileName,
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
