import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import {
  CleanAndProcessDataDto,
  CleanAndProcessDataInterface,
  CleanedDataTable,
  TmdbSearchResponse,
  TmdbSearchResult,
} from '@netflix/types';
import axios, { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IngestService {
  private readonly TMDB_API = 'https://api.themoviedb.org/3';
  private movieCache = new Map<string, TmdbSearchResult | null>();

  async cleanAndProcessData(
    data: CleanAndProcessDataDto[],
    configService: ConfigService,
  ): Promise<CleanAndProcessDataInterface[]> {
    return Promise.all(
      data.map(async (item) => ({
        startTime: new Date(item.startTime),
        profileName: String(item.profileName ?? '').trim(),
        country: item.country ?? null,
        bookmark: item.bookmark ?? null,
        latestBookmark: item.latestBookmark ?? null,
        supplementalVideoType: item.supplementalVideoType ?? null,
        attributes: item.attributes ?? null,
        deviceType: item.deviceType ?? null,
        title: String(this.formatTitle(item.title) ?? '').trim(),
        metadata: await this.enrichCleanedData(
          this.formatTitle(item.title),
          configService,
        ),
      })),
    );
  }

  async enrichCleanedData(
    title: string,
    configService: ConfigService,
  ): Promise<TmdbSearchResult | null> {
    if (!title) return null;

    const cached = this.movieCache.get(title);
    if (cached) return cached;

    const apiKey = configService.get<string>('TMDB_API_KEY');
    if (!apiKey) {
      console.error('TMDB_API_KEY missing in env');
      return null;
    }

    try {
      const searchRes: AxiosResponse<TmdbSearchResponse> = await axios.get(
        `${this.TMDB_API}/search/multi`,
        {
          params: {
            api_key: apiKey,
            query: title,
          },
        },
      );

      if (!searchRes.data.results.length) {
        this.movieCache.set(title, null);
        return null;
      }

      const details = searchRes.data;
      const movie = details.results[0];

      movie.poster_path = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null;
      movie.backdrop_path = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`
        : null;

      this.movieCache.set(title, movie);

      return movie;
    } catch (error) {
      console.error('TMDB error:', error);
      this.movieCache.set(title, null);
      return null;
    }
  }

  private mapToSupabase(item: CleanAndProcessDataInterface): CleanedDataTable {
    return {
      start_time: item.startTime,
      profile_name: item.profileName,
      country: item.country,
      bookmark: item.bookmark,
      latest_bookmark: item.latestBookmark,
      supplemental_video_type: item.supplementalVideoType,
      attributes: item.attributes,
      device_type: item.deviceType,
      title: item.title,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      metadata: item.metadata,
    };
  }

  async insertMany(
    data: CleanAndProcessDataInterface[],
    configService: ConfigService,
  ) {
    const supabase = createClient(
      configService.get<string>('SUPABASE_URL')!,
      configService.get<string>('SUPABASE_SERVICE_KEY')!,
    );

    const mapped = data.map((item) => this.mapToSupabase(item));

    const { error } = await supabase.from('cleaned_data').insert(mapped);

    if (error) {
      console.error('❌ Error inserting into Supabase:', error);
      throw error;
    }

    return true;
  }

  formatTitle(title: string): string {
    let cleanTitle = title;

    cleanTitle = cleanTitle.replace(/_hook_\d+/i, '');

    cleanTitle = cleanTitle.replace(/\(.*?\)/g, '');

    if (cleanTitle.includes(':')) {
      cleanTitle = cleanTitle.split(':')[0];
    }

    cleanTitle = cleanTitle.replace(/(Season|Saison)\s\d+/i, '');

    return cleanTitle.trim();
  }
}
