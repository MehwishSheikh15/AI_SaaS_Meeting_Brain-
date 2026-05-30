/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SampleTranscript {
  id: string;
  title: string;
  description: string;
  transcript: string;
}

export const SAMPLE_TRANSCRIPTS: SampleTranscript[] = [
  {
    id: 'launch-sync',
    title: '🚀 Q3 Product Launch & Launch Align Sync',
    description: 'Sarah (Product Lead), Marcus (Engineering), Linda (Marketing), and Dave (Operations) map out final rollout milestones and resolve beta blockers.',
    transcript: `[00:02] Sarah (Product Lead): Alright team, let's get started. We've got our Q3 launch coming up in less than a month, and we need to iron out the final roadmap, align on dates, and resolve any critical engineering or marketing blockers. First up, Marcus, how is the database migration and final stability check looking?

[00:45] Marcus (Engineering): Hey Sarah. The database migration scripts are written and tested in staging. They ran without errors on the 10M record replica set. However, we're seeing an intermittent deadlock issue on the user session table during peak-load simulation. Justin has been diving into it. It's a blocker for opening the private beta wide.

[01:15] Sarah (Product Lead): Okay, that session deadlock is too risky. When do we expect a fix?

[01:28] Marcus (Engineering): Justin thinks it's a lock ordering issue in our transaction middleware. He needs until Wednesday afternoon to refactor the pool lock logic, run tests, and push a patch to staging. Once that's verified, we should be green to open up the private beta to the full 2,000 waitlisted accounts.

[01:50] Sarah (Product Lead): Understood. So, Marcus, let's lock in Wednesday, June 3rd, for that patch, and then we'll officially open the wider Private Beta on Thursday, June 4th. Dave, from operations and cloud scale, can we handle those 2,000 concurrent beta users?

[02:18] Dave (Operations): Absolutely. I've set up auto-scaling rules on our staging cluster to scale from 2 to 6 node instances. I also spoke to Cloudflare support, and we've configured our rate-limiting rules and static asset caching. We are robustly protected against unexpected bursts. My only request is that we don't deploy anything else to production on Tuesday while we do our mock drill.

[02:45] Sarah (Product Lead): Deal. No config changes or hotfixes on Tuesday. That's a key decision to keep staging stable. Now let's move to marketing. Linda, what's our plan for the Product Hunt and public release?

[03:00] Linda (Marketing): Thanks, Sarah. We've drafted all the promotional content, and the design team finished the vector assets for the launch. Currently, we have the Product Hunt launch scheduled for Monday, June 15th. However, if Marcus's database lock fix doesn't go live until late this week, that leaves us with exactly 10 days of public beta. That feels exceptionally tight if we find any critical client-side bugs. I heavily recommend pushing the Product Hunt launch and general public release back by exactly one week to June 22nd.

[03:42] Sarah (Product Lead): Hmm. Pushing a week is always tough on marketing calendars, but stability is our number one asset. Marcus, if we push general launch to Monday, June 22nd, does that give your team enough breathing room to triage early feedback from the wider beta group?

[03:59] Marcus (Engineering): It would be a lifesaver. We'd have two full weeks of active beta testing rather than a compressed 10 days, allowing us to patch any frontend edge cases or API latency issues.

[04:12] Sarah (Product Lead): Excellent. Let's make that official. The general public launch and Product Hunt campaign are pushed from June 15th to Monday, June 22nd. Linda, can you adjust our press releases and coordinate with the guest bloggers about this updated timeframe?

[04:32] Linda (Marketing): Yes, I can easily reschedule those. I will reach out to our launch partners and guest writers today to make sure they hold their posts until June 22nd. I will also submit our finalized email copies to you for review by Friday, June 5th.

[04:48] Sarah (Product Lead): Perfect. Let's recap the tasks. Marcus is supervising Justin on the deadlock patch, with a completion deadline of Wednesday afternoon. Dave is coordinating the scaling rules and static asset caching, locked in with no Tuesday deployments. Linda is shifting the launch collateral to June 22nd and will send the email newsletter drafts to me by Friday. I will oversee the communication plan. Any other issues?

[05:22] Dave (Operations): Just a minor thing—I'll need Linda to supply the high-res campaign assets so we can load them into the Cloudflare CDN by next Monday, June 8th.

[05:33] Linda (Marketing): I'll zip them up and share the Google Drive link with you before end of day today, Dave.

[05:40] Sarah (Product Lead): Great teamwork, everyone. Let's execute. Session adjourned!`
  },
  {
    id: 'dashboard-latency',
    title: '⚡ Customer Support & High Dashboard Latency',
    description: 'Elena (Director of Customer Support), Richard (Principal Architect), and Tom (VP of Product) urgently address client complaints regarding slow load times.',
    transcript: `[00:01] Elena (Support): Thanks for hopping on so quickly, guys. Over the last 48 hours, support tickets under the "Dashboard Slow" category have spiked by over 300%. Our premium clients, specifically those at Acme Corp and Stellar Retail, are reporting that their active loading indicators spin for upwards of 8 to 12 seconds before any data displays. We're getting blasted with 1-star reviews on the app store, and we need an emergency response plan.

[00:40] Tom (VP of Product): Wow, 12 seconds is completely unacceptable. Our SLA guarantees sub-2-second loads. Richard, what is the core bottleneck? Is it our API layer or the underlying analytical database?

[00:55] Richard (Principal Architect): It is a combination. I've been profiling the API gateway queries. The primary bottleneck is the 'getDashboardOverview' endpoint. It triggers a complex dashboard query that runs a multi-table JOIN across our transactional ledger, user audit trails, and device telemetry tables to return the total live sales numbers. This transactions ledger table now has over 50 million rows, and the query is performing a sequential table scan because our composite index broke after the last release.

[01:30] Tom (VP of Product): Wait, why did the composite index break?

[01:35] Richard (Principal Architect): During last Wednesday's schema optimization patch, we renamed the 'account_created_at' column to 'created_at'. The index wasn't updated to reflect this column rename, so the database engine is falling back to a full table scan. In addition, the gateway is trying to grab the entire history instead of applying pagination.

[01:58] Tom (VP of Product): It sounds like the index drop is an easy fix, but the full historical lookup is an architectural flaw. What can we do today to alleviate the immediate stress on our premium clients?

[02:15] Elena (Support): Yes, we need a fast band-aid. The tickets are stacking up, and I need a clear statement I can give to customer accounts to reassure them.

[02:28] Richard (Principal Architect): First, I can manually re-create the missing composite index directly on the production database. That should bring our query response times down from 12 seconds to roughly 3.5 seconds. I can run that migration script in our low-traffic window today at 11:00 PM EST.

[02:50] Tom (VP of Product): Excellent. Let's approve that. Elena, can you communicate to Acme Corp and Stellar Retail that our team has identified the localized index bottleneck and is deploying a database query optimization at 11:00 PM EST tonight, which will dramatically restore display responsiveness?

[03:10] Elena (Support): Absolutely. That's a perfect update. Realistically, though, what's our permanent engineering strategy to hit our sub-2-second benchmark?

[03:22] Richard (Principal Architect): The ultimate solution is twofold. First, we must implement cursor-based pagination on the transactional queries. Second, we should stop running live counts on transactional ledgers inside the main UI dashboard. We should use a Redis cache for aggregated dashboard totals, which refreshes once every 5 minutes rather than on every refresh. I can have the pagination query and Redis configuration implemented on dev by Friday, June 5th.

[03:55] Tom (VP of Product): Agreed. Let's implement cursor-based pagination and aggregated caching. Let's make it a high priority. Richard, you'll deploy the hotfix index migration tonight, and then target next Tuesday, June 9th, for deploying the pagination and Redis cache to production after verification on staging.

[04:20] Richard (Principal Architect): Yes, that timeline is doable. I'll need Tom to sign off on the UX specs for the pagination controls, as it will change the infinite scroll behavior slightly.

[04:30] Tom (VP of Product): I'll review and sign off on those specs. Send them over to me by tomorrow afternoon, Richard. I will also write up a customer-facing incident post-mortem explaining the index issue and sharing our aggressive optimization pipeline to rebuild confidence among clients.

[04:48] Elena (Support): Perfect. I will coordinate our support desks. We'll set up macros for our templates to reference Richard's tonight deployment, and we will closely track the tickets tomorrow morning to confirm performance reports from clients.

[05:10] Tom (VP of Product): Thanks everyone. Excellent speed on diagnosing this. Let's get our dashboards back to lightning speed. Meeting closed.`
  },
  {
    id: 'budget-strategic',
    title: '🤝 Q3 Strategic Alignment & Sales Expansion Budget',
    description: 'Robert (CEO), Amanda (CFO), and Nicholas (VP of Sales) discuss revenue targets, strict travel limits, and an emergency sales hire in APAC.',
    transcript: `[00:01] Robert (CEO): Good morning, team. We've got a crucial session today to lock in our Q3 financial parameters and reconcile our strategic hiring goals. Nicholas, I saw your proposal for expanding the sales teams. Before we get into that, Amanda, could you give us an overview of our Q2 final performance and Q3 operational constraints?

[00:25] Amanda (CFO): Sure, Robert. We closed Q2 with $4.2M in Net New ARR, which is roughly 96% of our stretch goal. However, our operational expenditures exceeded budgets by 8% due to high infrastructure cloud spend and corporate travel. For Q3, we have a firm corporate goal of keeping our operational margin above 22%. Because of this, I am keeping our company-wide non-critical hiring freeze active. Any exception will need immediate business justification and Robert's executive signature.

[01:02] Robert (CEO): Thanks, Amanda. So the guidelines for Q3 are structural discipline and infrastructure cost reduction. Given those constraints, Nicholas, walk us through your APAC expansion request.

[01:15] Nicholas (VP of Sales): Thanks. I completely respect the fiscal discipline, but the APAC market is currently experiencing hyper-growth. We have over $1.5M in high-intent inbound pipeline from enterprise financial institutions in Singapore and Tokyo. Right now, we have exactly zero local field representatives there. We are trying to service these multi-million-dollar leads from London and San Francisco, which means massive timezone friction and missed calls. I am asking for an emergency exception to hire two Senior Account Executives based in Singapore starting immediately.

[01:52] Amanda (CFO): Two Senior AEs with localized benefits in Singapore will run us close to $350k annually in overhead. Nicholas, do we have any evidence that our win rate will cover that cost inside Q3?

[02:10] Nicholas (VP of Sales): Yes. Our Singapore inbound lead response cycle is currently 18 hours. Whenever we respond in under an hour, our demo-to-close ratio spikes from 12% to 45%. A local AE can maintain that instant response level. I am confident that one local Senior AE can close at least $400k of our existing Singapore pipeline before the end of Q3, completely self-funding their hire and returning an immediate profit.

[02:40] Robert (CEO): One local AE rather than two seems like a safer compromises. If we hire one stellar Senior AE in Singapore, they can manage the high-intent accounts first and prove the model. Amanda, can we fit one Senior AE exception into the strategic Q3 budget?

[03:00] Amanda (CFO): If we scale it down to exactly one hire, and Nicholas trims 20% off his team's international client travel budget for the rest of Q2 and Q3, yes, we can offset the overhead. That keeps us within our 22% margin limit.

[03:22] Nicholas (VP of Sales): I can agree to that. We can do remote onboarding and replace early phase client visits with high-fidelity Zoom webinars. Cutting 20% from the travel budget is a fair trade for local APAC presence.

[03:40] Robert (CEO): Excellent. That's a decision. We will approve exactly one Senior Account Executive hire in Singapore. Nicholas will reduce the Sales team's general travel budget by 20% to fund the payroll exception. Amanda, can you draw up the revised budget spreadsheet reflecting this arrangement?

[04:02] Amanda (CFO): Yes, I will update the master sheet and send the finalized figures to you for signature by Monday morning, June 1st. I will also notify HR to unfreeze a single Senior Sales role location-restricted to Singapore.

[04:20] Nicholas (VP of Sales): Perfect. I will immediately draft the localized job description and work with HR to open the pipeline. I'll make sure the position is posted on LinkedIn by Wednesday, June 3rd. My goal is to start active interviewing by June 15th so we can have them onboarded by early July.

[04:42] Robert (CEO): Wonderful. Let's monitor this setup closely. If the performance numbers hit Nicholas's targets by September, we will discuss opening the second role. Let's keep our heads down and hit our targets. Thanks, both.`
  }
];
