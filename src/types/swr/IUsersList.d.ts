// types
import { TPrimitive } from "../utils/TPrimitive";

export interface ISingleUser {
  [key: string]: TPrimitive;
  id: string;
  order: number;
  subdivision: string;
  position: string;
  rank: string;
  fullName: string;
  place: string;
  speciality: string;
  vos: string;
  period: {
    from: string;
    to: string;
  };
  order: string;
  orderNote: string;
}
