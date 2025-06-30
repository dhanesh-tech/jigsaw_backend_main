import { HmsRoomUserRoles } from 'src/_jigsaw/enums';

/**
 * Data Transfer Object for HMS Room.
 *
 * @property {string} name - The name of the room.
 * @property {string} description - A brief description of the room.
 * @property {string} template_id - The ID of the template associated with the room.
 * @property {string} region - The region where the room is located.
 */
export class HmsRoomDto {
  name: string;
  description: string;
  template_id: string;
  region: string;
}

/**
 * Data Transfer Object for HmsRoomToken used when fetching joining token
 *
 * @property {string} roomId - The unique identifier of the room.
 * @property {HmsRoomUserRoles} role - The role of the user in the room.
 * @property {string} userId - The unique identifier of the user.
 * @property {number} issuedAt - The timestamp when the token was issued.
 * @property {number} validForSeconds - The duration in seconds for which the token is valid.
 * @property {number} notValidBefore - The timestamp before which the token is not valid.
 */
export class HmsRoomTokenDto {
  roomId: string;
  role: HmsRoomUserRoles;
  userId: string;
  issuedAt: number;
  validForSeconds: number;
  notValidBefore: number;
}
