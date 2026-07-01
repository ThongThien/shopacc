export interface TicketMessage {
  userId: number;
  username: string;
  isAdmin: boolean;
  text: string;
  createdAt: string;
}

export interface Ticket {
  id: number;
  userId: number;
  subject: string;
  category: "ACCOUNT" | "DEPOSIT";
  status: "OPEN" | "CLOSED";
  lastReplyByAdmin: boolean;
  messages: string; // JSON array, parse to TicketMessage[]
  createdAt: string;
  updatedAt: string;
}
