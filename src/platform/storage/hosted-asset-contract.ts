import {z} from "zod";
export const hostedAssetSchema=z.object({id:z.string().uuid(),name:z.string(),mimeType:z.string(),sizeBytes:z.number().int(),status:z.enum(["UPLOADING","PENDING_SCAN","AVAILABLE","REJECTED"]),createdAt:z.string(),ownerAccountId:z.string().uuid(),rootAssetId:z.string().uuid().optional(),revision:z.number().int().positive().optional()});
export type HostedAsset=z.infer<typeof hostedAssetSchema>;
