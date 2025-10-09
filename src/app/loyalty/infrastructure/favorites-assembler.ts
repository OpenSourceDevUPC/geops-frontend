import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { FavoriteRowResource, FavoriteRowsResponse } from './favorites-response';

export type FavoriteRow = FavoriteRowResource;

export class FavoritesAssembler
  implements BaseAssembler<FavoriteRow, FavoriteRowResource, FavoriteRowsResponse>
{
  /**
   * convierte un recurso recibido de la api a una entidad de dominio
   * @param r - recurso recibido de la api
   */
  toEntityFromResource(r: FavoriteRowResource): FavoriteRow {
    return { ...r };
  }

  /**
   * convierte una entidad de dominio al formato de recurso esperado por la api
   * @param e - entidad de dominio
   */
  toResourceFromEntity(e: FavoriteRow): FavoriteRowResource {
    return { ...e };
  }

  /**
   * convierte una respuesta "envoltorio" de la API a un arreglo de entidades
   * @param _r - respuesta de la api
   */
  toEntitiesFromResponse(_r: FavoriteRowsResponse): FavoriteRow[] {
    return [];
  }
}
