import { ChatPage } from "@/components/chat/chat-page";

export default async function ChatRoute({ params }: { params: Promise<{ chatid: string }> }) {
	const { chatid } = await params;
	return <ChatPage conversationId={chatid} />;
}
