export const MOCK_AGENTS = [
	{
		id: "1",
		name: "Alex",
		role: "Customer Support Agent",
		status: "Active",
		description: "Answers customer queries, processes refunds, and escalates angry customers.",
		avatar: "A",
		stats: "1,240 tickets resolved",
		color: "bg-blue-500",
		memory: "Alex remembers the last 50 interactions with high-value customers. He also knows the company's 30-day refund policy intimately. He is aware of the current ongoing issue with shipping delays in the Midwest region.",
		systemPrompt: "You are Alex, a senior customer support agent for Woops. Your main goal is to ensure customer satisfaction. Be polite, concise, and helpful. Always check the customer's order history before responding. If a customer is visibly upset and asking for a manager, immediately escalate the ticket using the Escalation Skill.",
		integrations: ["slack", "zendesk", "gmail", "stripe"],
		skills: [
			{ id: "s1", name: "Process Refund", description: "Trigger a refund via the Stripe API for a given order ID." },
			{ id: "s2", name: "Create Ticket", description: "Create a new high-priority escalation ticket in Zendesk." },
			{ id: "s3", name: "Send Email", description: "Send a follow-up email to the customer using Gmail." }
		],
		knowledge: [
			{ id: "k1", name: "Refund Policy 2024", type: "PDF", size: "1.2 MB" },
			{ id: "k2", name: "Support SOPs", type: "Notion", size: "15 pages" },
			{ id: "k3", name: "Product Catalog", type: "CSV", size: "8.4 MB" }
		]
	},
	{
		id: "2",
		name: "Sarah",
		role: "Sales Development Rep",
		status: "Stopped",
		description: "Outbound lead generation, email outreach, and initial qualification.",
		avatar: "S",
		stats: "Learning from 52 PDFs",
		color: "bg-violet-500",
		memory: "Sarah remembers the lead scoring criteria. She knows which leads have opened emails more than 3 times without replying. She has context from the latest product launch webinar.",
		systemPrompt: "You are Sarah, a highly driven Sales Development Representative. Your goal is to qualify inbound leads and generate outbound meetings. Keep your emails under 100 words. Always include a clear call to action. Do not be pushy, but be persistent.",
		integrations: ["salesforce", "linkedin", "apollo"],
		skills: [
			{ id: "s4", name: "Qualify Lead", description: "Score a lead based on firmographics and engagement history." },
			{ id: "s5", name: "Log Activity", description: "Log the email outreach activity directly into Salesforce." }
		],
		knowledge: [
			{ id: "k4", name: "Sales Playbook", type: "PDF", size: "5.5 MB" },
			{ id: "k5", name: "Objection Handling Guide", type: "Google Docs", size: "4 pages" }
		]
	},
	{
		id: "3",
		name: "Marcus",
		role: "HR Assistant",
		status: "Stopped",
		description: "Onboarding automation and internal policy Q&A for employees.",
		avatar: "M",
		stats: "Needs tool configuration",
		color: "bg-amber-500",
		memory: "Marcus retains all current company policies including the 2024 remote work guidelines and the new health benefits package. He tracks which employees have completed their mandatory compliance training.",
		systemPrompt: "You are Marcus, the internal HR Assistant. You support employees with internal inquiries. Always maintain strict confidentiality. If you do not know the answer to a policy question, direct the employee to humanresources@company.com rather than guessing.",
		integrations: ["workday", "notion", "google_calendar"],
		skills: [
			{ id: "s6", name: "Schedule Interview", description: "Find available time slots in Google Calendar and send an invite." },
			{ id: "s7", name: "Fetch Policy", description: "Retrieve the latest HR policy documents from Notion." }
		],
		knowledge: [
			{ id: "k6", name: "Employee Handbook", type: "PDF", size: "12.1 MB" },
			{ id: "k7", name: "Benefits Overview 2024", type: "PDF", size: "3.2 MB" }
		]
	},
];
