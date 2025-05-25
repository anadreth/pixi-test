export interface TileProperties {
  elevation: number;
  texture: string;
  walkable: boolean;
}

export const DEFAULT_PROPERTIES: TileProperties = {
  elevation: 0,
  texture: 'grass',
  walkable: true
};

// Available texture options
export const TEXTURE_OPTIONS = [
  { id: 'grass', name: 'Grass' },
  { id: 'stone', name: 'Stone' },
  { id: 'sand', name: 'Sand' },
  { id: 'water', name: 'Water' },
  { id: 'snow', name: 'Snow' },
];
