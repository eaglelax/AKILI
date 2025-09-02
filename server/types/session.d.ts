import 'express-session';
import { TeamMember } from '@shared/schema';

declare module 'express-session' {
  interface SessionData {
    teamMember?: TeamMember;
  }
}