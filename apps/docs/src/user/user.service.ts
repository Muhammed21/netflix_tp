import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { CleanedDataTable } from '@netflix/types';

@Injectable()
export class UserService {
  public formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  async getWatchedMovies(
    profileName: string,
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
      .eq('profile_name', profileName)
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
      (sum, item) => sum + this.parseTimeString(item.latest_bookmark),
      0,
    );

    return {
      data: data as CleanedDataTable[],
      total: count || 0,
      totalWatchTime: this.formatDuration(totalWatchTime),
    };
  }

  parseTimeString(time: string | null | undefined): number {
    if (!time) return 0;

    const parts = time.trim().split(':').map(Number);

    if (parts.some(isNaN)) return 0;

    let seconds = 0;

    if (parts.length === 4) {
      seconds = parts[0] * 86400 + parts[1] * 3600 + parts[2] * 60 + parts[3];
    } else if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
      seconds = parts[0];
    }

    return seconds;
  }
}
