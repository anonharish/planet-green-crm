export interface JunkLead {
  uuid: string;
  lead_id: string;
  customer_name: string;
  phone_number: string;
  email_address: string;
  project: string;
  relationship_manager: {
    name: string;
    avatar?: string;
    initials: string;
    rating?: number;
    tag?: string;
  };
  junk_reason: string;
  junk_reason_description?: string;
  verification_audit: {
    attempt: number;
    status: string;
    time: string;
  }[];
}

export const junkLeads: JunkLead[] = [
  {
    uuid: "1cdb8821-43d1-4558-979b-6cb48c6b5970",
    lead_id: "LD-8821",
    customer_name: "Aarav Sharma",
    phone_number: "+91 98765 43210",
    email_address: "aarav.sharma@example.in",
    project: "The Grand Atrium",
    relationship_manager: {
      name: "Vikas Khanna",
      initials: "VK",
      rating: 4.8,
      tag: "Top Tier",
    },
    junk_reason: "Invalid Number",
    junk_reason_description: "Phone number is invalid after multiple attempts and customer's initial inquiry seems spammy.",
    verification_audit: [
      { attempt: 1, status: "No Answer", time: "10:45 AM" },
      { attempt: 2, status: "Invalid Number Response", time: "11:15 AM" },
      { attempt: 3, status: "Automated Disconnect", time: "12:30 PM" },
    ],
  },
  {
    uuid: "2cdb8844-43d1-4558-979b-6cb48c6b5971",
    lead_id: "LD-8844",
    customer_name: "Ishita Kapoor",
    phone_number: "+91 98765 12345",
    email_address: "ishita.k@gmail.com",
    project: "Skyline Residency",
    relationship_manager: {
      name: "Kiran Rao",
      initials: "KR",
    },
    junk_reason: "Invalid Number",
    verification_audit: [],
  },
  {
    uuid: "3cdb8902-43d1-4558-979b-6cb48c6b5972",
    lead_id: "LD-8902",
    customer_name: "Vikram Singh",
    phone_number: "+91 77766 55443",
    email_address: "vikram.s@outlook.com",
    project: "Emerald Woods",
    relationship_manager: {
      name: "Sanjay Dutt",
      initials: "SD",
    },
    junk_reason: "Invalid Number",
    verification_audit: [],
  },
  {
    uuid: "4cdb8915-43d1-4558-979b-6cb48c6b5973",
    lead_id: "LD-8915",
    customer_name: "Priya Verma",
    phone_number: "+91 88877 66554",
    email_address: "p.verma@outlook.com",
    project: "The Grand Atrium",
    relationship_manager: {
      name: "Anita Desai",
      initials: "AD",
    },
    junk_reason: "Invalid Number",
    verification_audit: [],
  },
];
