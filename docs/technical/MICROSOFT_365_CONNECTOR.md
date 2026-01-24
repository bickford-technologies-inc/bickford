# Microsoft 365 Connector

The Microsoft 365 connector is available for users on Team and Enterprise plans. It connects Claude to SharePoint, OneDrive, Outlook, and Teams through the Microsoft Graph API so Claude can search and analyze your organization’s data with citations.

## What the connector enables

With Microsoft 365 connected, Claude can:

- Search and analyze documents across SharePoint sites and OneDrive libraries.
- Access email threads and analyze communications from Outlook.
- Review meeting information from Teams Calendar.
- Pull insights from Teams Chat discussions.

## Enabling the Microsoft 365 connector

Enabling the connector requires two setup phases, and specific steps must be completed by a Microsoft Entra ID Global Administrator and a Claude Team or Enterprise plan Owner.

### Prerequisites

- A Claude user with an Owner or Primary Owner role on a Team or Enterprise organization.
- Someone with Global Administrator access to your Microsoft Entra tenant.
- Users must have Microsoft 365 accounts to connect and start using the connector.

### Phase 1: Initial Microsoft Entra Global Administrator setup

A Microsoft Entra Global Administrator must complete a one-time setup process before Claude Team and Enterprise plan users can connect.

#### Automatic setup through auth consent flow (recommended)

1. **Enable in Claude Admin Settings**
   - Sign in to Claude as an organization Owner and Microsoft Entra Global Administrator.
   - Navigate to **Admin Settings > Connectors**.
   - Select **Browse connectors** and add **Microsoft 365** to your team.
   - Verify **Microsoft 365** appears in **Settings > Connectors**.

2. **Enable in individual Claude Settings**
   - Navigate to **Settings > Connectors**.
   - Find **Microsoft 365** and select **Connect**.
   - Authenticate with Microsoft 365 credentials and accept permissions.
   - Check the box to grant access on behalf of the whole organization.

3. **Optional restrictions**
   - To restrict which users can authenticate, open the **M365 MCP Server for Claude** enterprise application in Entra admin center, set **Assignment required?** to **Yes**, and add users or groups. Repeat the process for **M365 MCP Client for Claude**.
   - To selectively restrict permission scopes, see [Permission categories](#permission-categories) and [Selectively revoking permissions](#selectively-revoking-permissions).

#### Manual setup in Microsoft Entra ID

Use manual setup if your Global Administrator is not a member of the Claude organization or if you need to troubleshoot app install and permissions.

1. **Add the service principals** (using Microsoft Graph Explorer)

   - **M365 MCP Client for Claude**
     ```http
     POST https://graph.microsoft.com/v1.0/servicePrincipals
     {"appId":"08ad6f98-a4f8-4635-bb8d-f1a3044760f0"}
     ```

   - **M365 MCP Server for Claude**
     ```http
     POST https://graph.microsoft.com/v1.0/servicePrincipals
     {"appId":"07c030f6-5743-41b7-ba00-0a6e85f37c17"}
     ```

2. **Grant admin pre-consent**

   Visit the following URLs in your browser, replacing `{your-tenant-id}`:

   - **M365 MCP Client for Claude**
     ```
     https://login.microsoftonline.com/{your-tenant-id}/adminconsent?client_id=08ad6f98-a4f8-4635-bb8d-f1a3044760f0
     ```

   - **M365 MCP Server for Claude**
     ```
     https://login.microsoftonline.com/{your-tenant-id}/adminconsent?client_id=07c030f6-5743-41b7-ba00-0a6e85f37c17
     ```

3. **Enable in Claude Admin Settings**
   - Sign in to Claude.
   - Navigate to **Admin Settings > Connectors**.
   - Select **Browse connectors** and add **Microsoft 365** to your team.

4. **Enable in individual Claude Settings**
   - Navigate to **Settings > Connectors**.
   - Select **Microsoft 365** and choose **Connect**.
   - Authenticate with Microsoft 365 credentials.
   - Accept permissions and grant access on behalf of the organization.

5. **Test the connector**
   - Start a new chat and request something simple (for example, “List all of my SharePoint docs”).
   - If Claude can access data using the Microsoft 365 connection, the connector is working.

### Phase 2: Enablement steps for Team and Enterprise users

Once enabled by an Owner, members can connect Microsoft 365 in their personal settings.

1. Navigate to **Settings > Connectors**.
2. Find **Microsoft 365** and select **Connect**.
3. Authenticate with Microsoft 365 credentials.

## How to use the Microsoft 365 connector

Ask Claude a question that requires accessing your Microsoft 365 data. Claude automatically detects which tools it needs and retrieves relevant information.

### Example queries

- “Find the Q4 strategic planning document in SharePoint.”
- “Summarize email conversations about the product launch.”
- “What discussions happened in the Teams channel about the marketing campaign?”
- “Review meeting notes from last week's leadership sync.”

## Capabilities

### SharePoint and OneDrive document access

- Search documents across SharePoint sites and libraries.
- Access files stored in OneDrive without manual uploads.
- Consolidate information from distributed locations and analyze trends.

### Outlook email analysis

- Search email threads and conversations to track status, feedback, and alignment.
- Filter by date, sender, subject, and metadata.
- Analyze communication patterns and find specific content.

### Outlook Calendar meeting analysis and summarization

- Review meeting summaries, attendee information, and content.
- Analyze scheduling patterns and track project decisions.

### Teams chat capabilities

- Access Teams chat messages and channel discussions where you are a participant.
- Review collaboration patterns and decisions across conversations.

## Permission categories

All permissions are delegated, which means Claude acts on behalf of the user’s Microsoft 365 account and can only access data the user already has permission to view. The connector is read-only: Claude cannot modify, delete, or create content.

### Basic access

- `User.Read`: Sign in and read your user profile.
- `openid`: Sign in with your organizational account.
- `offline_access`: Maintain access to data you have given it access to.
- `email`: View your email address.
- `profile`: View your basic profile information.

### Email (Outlook)

- `Mail.Read`: Read your email messages.
- `Mail.ReadBasic`: Read email metadata (sender, subject, date).
- `Mail.Read.Shared`: Read emails in mailboxes you have access to.
- `MailboxFolder.Read`: Read your mailbox folder structure.
- `MailboxItem.Read`: Read items in your mailbox.

### Calendar

- `Calendars.Read`: Read your calendar events.
- `Calendars.Read.Shared`: Read calendars shared with you.

### Teams Chat

- `Chat.Read`: Read your Teams chat messages.
- `Chat.ReadBasic`: Read Teams chat metadata.
- `ChatMember.Read`: Read information about chat participants.
- `ChatMessage.Read`: Read your Teams chat messages.

### Teams Channels

- `Channel.ReadBasic.All`: Read channel names and descriptions.
- `ChannelMessage.Read.All`: Read channel messages.

### Meetings

- `OnlineMeetings.Read`: Read your online meetings.
- `OnlineMeetingTranscript.Read.All`: Read meeting transcripts.
- `OnlineMeetingAiInsight.Read`: Read AI-generated meeting insights.
- `OnlineMeetingArtifact.Read.All`: Read meeting recordings and artifacts.
- `OnlineMeetingRecording.Read.All`: Read meeting recordings.

### Files (OneDrive and SharePoint)

- `Files.Read`: Read your files.
- `Files.Read.All`: Read all files you can access.
- `Sites.Read.All`: Read items in SharePoint sites.

### User directory

- `User.ReadBasic.All`: Read basic profile information for all users in your organization (used for finding meeting availability).

### Why these permissions are needed

These permissions allow Claude to:

- Search emails, documents, and calendars to answer questions.
- Access meeting information and Teams discussions.
- Provide accurate, contextual responses based on work data.

The connector searches SharePoint across the entire tenant using the permissions of the user; site-specific search restriction is unsupported.

## Selectively revoking permissions

To limit which resources the connector can access, selectively revoke permissions from the authorized scopes used by the Microsoft Graph API.

1. Navigate to [entra.microsoft.com](https://entra.microsoft.com).
2. Select **Enterprise Applications**.
3. Remove the application type filter.
4. Search for and open **M365 MCP Server for Claude**.
5. Go to **Permissions**.
6. Under the **Admin consent** tab and Microsoft Graph permissions list, select the permission you want to revoke and choose **Revoke permission**.

Claude will be unable to access resources via revoked permissions. Attempts to access a resource with a revoked permission will show a tool error.

To restore a revoked permission, follow the admin pre-consent steps in [Phase 1](#phase-1-initial-microsoft-entra-global-administrator-setup).

Users can also toggle off tools in the Microsoft 365 connector settings to prevent Claude from trying to access tools for which permission is revoked.

## Privacy and security

- **Permission inheritance**: Claude mirrors your existing Microsoft 365 permissions.
- **On-demand access**: Claude only accesses your data when you explicitly ask questions requiring it.
- **Revocable access**: You can disconnect the integration at any time through **Settings > Connectors**.

Read more in the Microsoft 365 Connector Security Guide.

## Troubleshooting

### Authentication is failing

- Verify you are using the correct Microsoft 365 account.
- Confirm your Microsoft 365 license is active.
- Check organizational policies that may require IT approval for third-party app access.
- Try a different browser (authentication popups can be blocked).
- Disable browser extensions that may interfere.
- Clear cookies and cache, then retry.

### Claude cannot find documents you know exist

- Verify your permissions in Microsoft 365 directly.
- Ensure the document is in SharePoint or OneDrive, not local storage.
- Account for indexing delays for recently uploaded documents.
- Specify the exact SharePoint site or library name.
- Search by exact file name or unique keywords.

### Search results are incomplete or irrelevant

- Be more specific about what you are looking for.
- Specify locations (site names, date ranges, document types).
- Use exact phrases for better matching.
- Break complex queries into smaller questions.

## FAQ

### Can Claude modify my Microsoft 365 data?

No. The connector provides read-only access. Claude cannot:

- Create, edit, or delete documents.
- Send emails or calendar invites.
- Modify SharePoint sites or OneDrive files.
- Change Teams settings or permissions.

### Can I use the Microsoft 365 connector with Enterprise Search?

Yes. When enabled, Enterprise Search can query Microsoft 365 alongside other connected tools and provide unified search across supported connectors.

### Can Claude search archived emails?

Yes. Claude can search all emails you have access to in Outlook, including archived messages.

### Does Claude search shared drives and team sites?

Yes. Claude can search any SharePoint sites and shared drives you have permission to access, including team sites, communication sites, and document libraries.

### Can Claude access private Teams channels?

Claude can only access Teams content that you have permission to view in Microsoft 365. If you are a member of a private channel, Claude can search for that content.

### How do I ask Claude to search specific locations?

Be specific in your queries:

- “Search the Engineering team site in SharePoint for architecture documents.”
- “Find emails from the last week about the Q4 budget.”
- “Show me Teams discussions with Sarah about the product roadmap.”
- “Find PowerPoint presentations in SharePoint about sales strategy.”

### Can Claude summarize long email threads?

Yes. Claude can analyze and summarize complex communications. Example: “Summarize the email thread about the vendor selection process.”

### What happens if a Microsoft 365 user tries to connect before a Microsoft Entra Global Administrator grants tenant-wide permission?

The connection attempt fails with an error indicating an administrator must grant app permissions. A Microsoft Entra Global Administrator must complete the admin consent steps in [Phase 1](#phase-1-initial-microsoft-entra-global-administrator-setup) before users can connect.
