var sheet = getSheetByGid(1161665315);
var teacherMetricSheet = getSheetByGid(982536025);
var lastRow = sheet.getLastRow(); // Get last row with data
var lastLessons = [];
var dataBank = [];
var nsdMode = false;
var missingRow;
var teacherFreeBlocks;

const backup_dash_url = "http://34.135.5.81/dash";
const backup_scrape_url = "http://34.135.5.81/scrape";
const backup_students_url = "http://34.135.5.81/students";

API_KEY = "<>";

let teacher = "<>";

const starterRow = 4;
const statusCell = [3,1];
const percentageCell = [5,1];
const updateCell = [14, 1];
const headerRow = 2;


function updateTeacherMetrics(){
  teacherMetrics(teacher);
  teacherAdds();
}

const headers = [
        "Program (Remain/ Total)", "PRI's this Week", "Next SCH LSN", "GRPs + PTYs Last 2 Weeks",
        "FR Chat?", "Historical Pace (6 mo)", "Current Pace (3 mo)", "GRP PTY Pace (3 mo)", "Cell Phone", "Email", "Preffered LSN Times", "Student", "Last Lesson", "Buddy", 'Chat' , "URLs", "Chat Needed", "ID + Index", "Chat Reason", "PRI's next Week" , "Next Event", "Current Goal", "Standing?", "Chat", "Confirm", "Deposit", "Notes", "Highlight Timestamps", "Your Free Blocks"];
const eventHeaders = [
  "Spotlight", "Progress Check/Check Out", "Upcoming Coach", "PJ Thon",
  "FTLOD Showcase", "Freestyle Checkout Party", "Medal Ball", "April Showcase",
  "Spring Spotlight Night", "Student Dance Camp", "Spring Showtime", "Boston DOR",
  "Summer Spotlight Night", "Block Party", "Newsome Twosome", "Mini Comp",
  "Fall Showcase", "Spook Spotlight Night", "Student Appreciation Party", "Holiday Jingle",
  "Revival Spotlight Night"
  ];

const eventDetails = {
  "PJ Thon": {
    date: ["01/11/2025"],
    location: ["In Studio"]
  },
  "FTLOD Showcase": {
    date: "02/14/2025",
    location: "In Studio"
  },
  "Freestyle Checkout Party": {
    date: "02/28/2025",
    location: "In Studio"
  },
  "Medal Ball": {
    date: "03/02/2025",
    location: "Village Hall, Framingham"
  },
  "April Showcase": {
    date: "04/05/2025",
    location: "Burlington Marriot"
  },
  "Spring Spotlight Night": {
    date: "04/18/2025",
    location: "In Studio"
  },
  "Student Dance Camp": {
    date: "04/26/2025",
    location: "Burlington Studio"
  },
  "Spring Showtime": {
    date: "05/09/2025",
    location: "In Studio"
  },
  "Boston DOR": {
    date: "06/05/2025",
    location: "Sheraton Boston Hotel, Boston MA"
  },
  "Summer Spotlight Night": {
    date: "07/11/2025",
    location: "In Studio"
  },
  "Block Party": {
    date: "07/12/2025",
    location: "Burlington Studio 6pm - 9:30pm"
  },
  "Newsome Twosome": {
    date: "08/08/2025",
    location: "In Studio"
  },
  "Mini Comp": {
    date: "08/23/2025",
    location: "Burlington Marriott"
  },
  "Fall Showcase": {
    date: "10/19/2025",
    location: "Burlington Marriott"
  },
  "Spook Spotlight Night": {
    date: "10/24/2025",
    location: "In Studio"
  },
  "Student Appreciation Party": {
    date: "12/12/2025",
    location: "In Studio"
  },
  "Holiday Jingle": {
    date: "12/14/2025",
    location: "Village Hall, Framingham"
  },
  "Revival Spotlight Night": {
    date: "12/26/2025",
    location: "In Studio"
  }
  };

  const childTeacherSheets = {
    "SR": "14L6IHXfLf7rqDvP0v7JC61UpNVBeeCt6VsuGbOcyndI",
    "SER": "1yHuFOTrlFRmsPL7XErgXZDAkgu57AcZQwCAzNwDzAbE",
    "RG": "1SS037inBuflZH5gLTucFS2lpBZBXERF3q2In52wa4tw",
    "LK": "134Cn6SZGa937vZiRPT6N7HipmqHHFp4Ds5fJr5AllII",
    "VO": "1KMKEG4VSPIQVtJdH1usC0SCkPrdqnyIuq18nkbUPg_w",
    "RS": "12bBcwa5ZmXJsw7eZDKgkn2YR8T2y04oYahcENQsDnfc",

  }

  const BLOCKS = {
    "Tuesday": ["2:45 PM", "3:30 PM", "4:15 PM", "5:15 PM", "6:00 PM", "6:45 PM", "7:30 PM", "8:15 PM", "9:00 PM"],
    "Wednesday": ["3:30 PM", "4:15 PM", "5:15 PM", "6:00 PM", "6:45 PM", "7:30 PM", "8:15 PM", "9:00 PM"],
    "Thursday": ["2:45 PM", "3:30 PM", "4:15 PM", "5:15 PM", "6:00 PM", "6:45 PM", "7:30 PM", "8:15 PM", "9:00 PM"],
    "Friday": ["2:45 PM", "3:30 PM", "4:15 PM", "5:15 PM", "6:00 PM", "6:45 PM", "7:30 PM", "8:15 PM", "9:00 PM"],
    "Saturday": ["10:00 AM", "10:45 AM", "11:30 AM", "12:15 PM", "1:15 PM", "2:00 PM", "2:45 PM", "3:30 PM", "4:15 PM", "5:00 PM"],
  }

  const TEACHER_SCHEDULE = {
      "Sandesh": ["Tuesday", "Wednesday", "Thursday", "Friday"],
      "Sharron": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "Romi": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "Luke": ["Thursday", "Friday"],
      "Veronica": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "Richard": ["Tuesday", "Wednesday", "Friday", "Saturday"],
  }

  const WORKING_BLOCKS = {
    2: ["2:45 PM", "3:30 PM", "4:15 PM", "5:15 PM", "6:00 PM", "6:45 PM", "7:30 PM", "8:15 PM", "9:00 PM"],
    3: ["3:30 PM", "4:15 PM", "5:15 PM", "6:00 PM", "6:45 PM", "7:30 PM", "8:15 PM", "9:00 PM"],
    4: ["2:45 PM", "3:30 PM", "4:15 PM", "5:15 PM", "6:00 PM", "6:45 PM", "7:30 PM", "8:15 PM", "9:00 PM"],
    5: ["2:45 PM", "3:30 PM", "4:15 PM", "5:15 PM", "6:00 PM", "6:45 PM", "7:30 PM", "8:15 PM", "9:00 PM"],
    6: ["10:00 AM", "10:45 AM", "11:30 AM", "12:15 PM", "1:15 PM", "2:00 PM", "2:45 PM", "3:30 PM", "4:15 PM", "5:00 PM"]
  };



const columns = findColumnHeaders(sheet, headers, headerRow);
// const NFA_Columns = findColumnHeaders(NFA_InventorySheet, headers, NFA_HeaderRow);
//Logger.log(NFA_Columns);



