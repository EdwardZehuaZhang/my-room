export interface ModelDef {
  key: string;
  name: string;
  url: string;
  idleAnim: string;
  walkAnim: string;
  scale: number;
  rotationY: number;
}

const BASE = 'https://threejs.org/examples/models/gltf/';

export const AVATAR_MODELS: ModelDef[] = [
  {
    key: 'robot',
    name: 'Robot',
    url: `${BASE}RobotExpressive/RobotExpressive.glb`,
    idleAnim: 'Idle',
    walkAnim: 'Walking',
    scale: 0.006,
    rotationY: Math.PI,
  },
  {
    key: 'soldier',
    name: 'Soldier',
    url: `${BASE}Soldier.glb`,
    idleAnim: 'Idle',
    walkAnim: 'Walk',
    scale: 0.006,
    rotationY: Math.PI,
  },
  {
    key: 'michelle',
    name: 'Michelle',
    url: `${BASE}Michelle.glb`,
    idleAnim: '',
    walkAnim: '',
    scale: 0.006,
    rotationY: Math.PI,
  },
  {
    key: 'xbot',
    name: 'X-Bot',
    url: `${BASE}Xbot.glb`,
    idleAnim: '',
    walkAnim: '',
    scale: 0.006,
    rotationY: Math.PI,
  },
];

export const DEFAULT_MODEL = AVATAR_MODELS[0];

export function getModel(key: string): ModelDef {
  return AVATAR_MODELS.find((m) => m.key === key) ?? DEFAULT_MODEL;
}

// Preload is done per-component based on selected model

