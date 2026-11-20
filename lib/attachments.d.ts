/**
 * Message attachment support for lark-agent-bridge — images and files sent to
 * the bot are downloaded into the chat's own workspace and handed to the
 * agent as file paths (the agent reads images via `read_image`).
 *
 * Security posture:
 *   - attachments land in `<workspaceRoot>/<chatId>/.attachments/` — the
 *     per-chat jail, never outside it;
 *   - file names are sanitized (no separators, no control chars, length
 *     capped) so a hostile name cannot escape the directory;
 *   - size limits are enforced from `bytesWritten` after the stream (the SDK
 *     has no pre-download length); oversized files are deleted immediately;
 *   - a count cap per message with a loud rejection summary;
 *   - files older than a week are swept on each download (best-effort).
 *
 * @module lark-agent-bridge/attachments
 */
/** Max attachments accepted from one message. */
export declare const MAX_ATTACHMENTS_PER_MESSAGE = 5;
/** Size cap for images (10 MB). */
export declare const MAX_IMAGE_BYTES: number;
/** Size cap for other files (20 MB). */
export declare const MAX_FILE_BYTES: number;
/** Attachment files older than this are swept on the next download (7 days). */
export declare const ATTACHMENT_TTL_MS: number;
/** The minimal channel surface `downloadAttachments` needs (structural, testable). */
export interface AttachmentChannelLike {
    downloadResourceToFile(messageId: string, fileKey: string, type: 'image' | 'file', destPath: string): Promise<{
        contentType?: string;
        bytesWritten: number;
    }>;
}
/** One inbound resource (subset of the SDK's ResourceDescriptor). */
export interface AttachmentResource {
    type: string;
    fileKey: string;
    fileName?: string;
}
/** An attachment successfully downloaded into the chat workspace. */
export interface DownloadedAttachment {
    path: string;
    type: 'image' | 'file';
    fileName: string;
    bytes: number;
}
/** Result of a download pass: what landed and what was rejected and why. */
export interface AttachmentResult {
    accepted: DownloadedAttachment[];
    rejected: Array<{
        fileName?: string;
        reason: string;
    }>;
}
/** Sanitize a file name for local storage: no separators, no control chars. */
export declare function safeAttachmentName(fileName: string | undefined, fallback: string): string;
/**
 * Download a message's resources into `dir` (created if needed), enforcing
 * count/size limits and sweeping stale files. Never throws: per-attachment
 * failures become rejection entries.
 */
export declare function downloadAttachments(channel: AttachmentChannelLike, messageId: string, resources: AttachmentResource[], dir: string, workspaceRoot?: string): Promise<AttachmentResult>;
