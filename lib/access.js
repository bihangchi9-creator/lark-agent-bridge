/**
 * Access control for lark-agent-bridge — the "who may drive this bot" gate.
 *
 * The security boundary of this plugin is exactly "who can send the bot a
 * message": every inbound message becomes an agent turn with host-level
 * permissions, so the entry check must be strict and fail-closed.
 *
 * Decision model (mirrors trae-to-lark's policy/access.ts):
 *   - the app owner (captured at registration, or resolved at runtime via the
 *     app-info API) always passes — this is the zero-config bootstrap path;
 *   - group chats pass when the chat id is in `allowedChats`;
 *   - DMs pass when the sender is in `allowedUsers`;
 *   - everything else is denied. An unknown owner is *not* a reason to allow:
 *     with no owner and empty allowlists, every message is denied and the
 *     denial message tells the user how to configure the bot.
 *
 * Pure function on purpose: the decision logic is unit-tested without any
 * Feishu or dsh machinery.
 *
 * @module lark-agent-bridge/access
 */
/**
 * Decide whether a message may drive the bot. Fail-closed by construction:
 * an unknown owner and empty allowlists deny everything.
 */
export function decideAccess(controls, msg) {
    if (controls.ownerId !== undefined && msg.senderId === controls.ownerId) {
        return { ok: true, reason: 'owner' };
    }
    if (msg.chatType === 'group' && controls.allowedChats.includes(msg.chatId)) {
        return { ok: true, reason: 'allowed-chat' };
    }
    if (msg.chatType === 'p2p' && controls.allowedUsers.includes(msg.senderId)) {
        return { ok: true, reason: 'allowed-user' };
    }
    return { ok: false, reason: 'denied' };
}
