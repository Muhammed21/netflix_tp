import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { CleanedDataTable } from '@netflix/types';
import { UserService } from '../user/user.service';

@Injectable()
export class MovieService {
  constructor(private readonly userService: UserService) {}

  async getMovies(
    movieName: string,
    configService: ConfigService,
    page = 1,
    limit = 20,
    mediaType?: 'movie' | 'tv',
    year?: number,
  ) {
    const supabase = createClient(
      configService.get<string>('SUPABASE_URL')!,
      configService.get<string>('SUPABASE_SERVICE_KEY')!,
    );

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('cleaned_data')
      .select('*', { count: 'exact' })
      .eq('title', movieName)
      .order('start_time', { ascending: false })
      .range(from, to);

    if (mediaType) {
      query = query.eq('metadata->>media_type', mediaType);
    }

    if (year) {
      const start = new Date(year, 0, 1).toISOString();
      const end = new Date(year + 1, 0, 1).toISOString();
      query = query.gte('start_time', start).lt('start_time', end);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error fetching watched movies:', error.message);
      throw new Error(error.message);
    }

    const totalWatchTime = (data as CleanedDataTable[]).reduce(
      (sum, item) =>
        sum + this.userService.parseTimeString(item.latest_bookmark),
      0,
    );

    return {
      data: data as CleanedDataTable[],
      total: count || 0,
      totalWatchTime: this.userService.formatDuration(totalWatchTime),
    };
  }
}
