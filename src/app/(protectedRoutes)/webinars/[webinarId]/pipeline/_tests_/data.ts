// mockGetWebinarAttendance.ts

export async function getWebinarAttendance(webinarId: string) {
  return {
    webinarTags: [
      "Hot Lead",
      "Demo Scheduled",
      "Follow Up",
      "Interested",
      "Tech",
    ],
    data: {
      attended: {
        count: 4,
        users: [
          { name: "Alice Johnson", email: "alice.johnson@example.com" },
          { name: "Bob Smith", email: "bob.smith@example.com" },
          { name: "Carol Williams", email: "carol.williams@example.com" },
          { name: "David Brown", email: "david.brown@example.com" },
        ],
      },
      interested: {
        count: 4,
        users: [
          { name: "Emma Davis", email: "emma.davis@example.com" },
          { name: "Frank Miller", email: "frank.miller@example.com" },
          { name: "Grace Lee", email: "grace.lee@example.com" },
          { name: "Hank Wilson", email: "hank.wilson@example.com" },
        ],
      },
      not_interested: {
        count: 3,
        users: [
          { name: "Isabel Moore", email: "isabel.moore@example.com" },
          { name: "Jack Taylor", email: "jack.taylor@example.com" },
          { name: "Karen Anderson", email: "karen.anderson@example.com" },
        ],
      },
      follow_up: {
        count: 4,
        users: [
          { name: "Leo Thomas", email: "leo.thomas@example.com" },
          { name: "Mia Martin", email: "mia.martin@example.com" },
          { name: "Nate Jackson", email: "nate.jackson@example.com" },
          { name: "Olivia White", email: "olivia.white@example.com" },
        ],
      },
      hot_lead: {
        count: 5,
        users: [
          { name: "Paul Harris", email: "paul.harris@example.com" },
          { name: "Queenie Lewis", email: "queenie.lewis@example.com" },
          { name: "Ryan Walker", email: "ryan.walker@example.com" },
          { name: "Sophie Hall", email: "sophie.hall@example.com" },
          { name: "Tom Young", email: "tom.young@example.com" },
        ],
      },
    },
  };
}
