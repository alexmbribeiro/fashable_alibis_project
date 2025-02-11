interface Time {
  hour: number;
  minute: number;
}

interface CrimeInfo {
  start: Time;
  end: Time;
  duration: number;
}

interface Activity {
  start: Time;
  end: Time;
  distance: number;
}

interface Suspect {
  activities: Activity[];
}

interface Case {
  crime: CrimeInfo;
  suspects: Suspect[];
}

interface Alibi {
  suspect: number;
  alibi: boolean;
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export function click() {
  const input = document.querySelector<HTMLInputElement>('#inputBox')!;
  const output = document.querySelector<HTMLOutputElement>('#outputBox')!;
  const button = document.querySelector<HTMLButtonElement>('#actionButton')!;

  button.addEventListener('click', () => {
    const lines = input.value.split("\n"); // Split text by new lines

    const case1 = parseInput(input.value);

    const alibis = checkAlibis(case1);

    output.value = formatCase(case1, alibis);
  });
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function parseInput(text: string): Case {
  const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
  
  // Parse crime information from the first line
  const [Ts, Te, C] = lines[0].split(" ");
  const [Hj, Mj] = Ts.split(":").map(Number);
  const start: Time = {
    hour: Hj,
    minute: Mj
  };
  const [Hk, Mk] = Te.split(":").map(Number);
  const end: Time = {
    hour: Hk,
    minute: Mk
  };
  const crime: CrimeInfo = {
    start: start,
    end: end,
    duration: parseInt(C)
  };

  // Parse the number of suspects
  const S = parseInt(lines[1]);
  let index = 2;
  const suspects: Suspect[] = [];

  for (let i = 0; i < S; i++) {
    const A = parseInt(lines[index]); // Number of activities
    index++;

    const activities: Activity[] = [];
    for (let j = 0; j < A; j++) {
      const [Tj, Tk, D] = lines[index].split(" ");
      const [Hj, Mj] = Tj.split(":").map(Number);
      const tttjjj: Time = {
        hour: Hj,
        minute: Mj
      };
      const [Hk, Mk] = Tk.split(":").map(Number);
      const tttkkk: Time = {
        hour: Hk,
        minute: Mk
      };
      activities.push({
        start: tttjjj,
        end: tttkkk,
        distance: parseInt(D)
      });
      index++;
    }

    suspects.push({ activities });
  }

  return { crime, suspects };
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function formatCase(parsedData: any, alibis: Alibi[]): string {
  let output = `Crime happened between ${parsedData.crime.start.hour}:${parsedData.crime.start.minute} and ${parsedData.crime.end.hour}:${parsedData.crime.end.minute}, lasting at least ${parsedData.crime.duration} minutes.\n\n`;
  
  output += `Number of suspects: ${parsedData.suspects.length}\n`;

  parsedData.suspects.forEach((suspect: any, i: number) => {
    output += `\nSuspect ${i + 1} - ${suspect.activities.length} activities:\n`;
    suspect.activities.forEach((activity: any, j: number) => {
      output += `  - Activity ${j + 1}: From ${activity.start.hour}:${activity.start.minute} to ${activity.end.hour}:${activity.end.minute}, ${activity.distance} min away\n`;
    });
    const alibi = alibis[i];
    output += `\n|------------|\nALIBI -- ${alibi.alibi ? "YES" : "NO"}\n|------------|\n`;
  });

  return output;
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function timeToMinutes(t: Time): number {
  return t.hour * 60 + t.minute;
}

function checkAlibis(c: Case): Alibi[] {
  const crimeStart = timeToMinutes(c.crime.start);
  const crimeEnd = timeToMinutes(c.crime.end);
  const crimeDuration = c.crime.duration;

  return c.suspects.map((suspect, index) => {
    let unavailablePeriods: { start: number; end: number }[] = [];

    for (const activity of suspect.activities) {
      const activityStart = timeToMinutes(activity.start);
      const activityEnd = timeToMinutes(activity.end);
      const travelTime = activity.distance;

      unavailablePeriods.push({
        start: activityStart - travelTime,
        end: activityEnd + travelTime,
      });
    }

    // Sort periods by start time
    unavailablePeriods.sort((a, b) => a.start - b.start);

    // Merge overlapping or adjacent periods
    let mergedPeriods: { start: number; end: number }[] = [];
    let lastPeriod = unavailablePeriods[0];

    for (let i = 1; i < unavailablePeriods.length; i++) {
      const currentPeriod = unavailablePeriods[i];

      if (currentPeriod.start <= lastPeriod.end) {
        // Merge overlapping periods
        lastPeriod.end = Math.max(lastPeriod.end, currentPeriod.end);
      } else {
        mergedPeriods.push(lastPeriod);
        lastPeriod = currentPeriod;
      }
    }
    mergedPeriods.push(lastPeriod);

    // Check for a free time window to commit the crime
    let hasAlibi = true;

    // Check before first activity
    if (mergedPeriods[0].start > crimeStart && mergedPeriods[0].start - crimeDuration >= crimeStart) {
      hasAlibi = false;
    }

    // Check between periods
    for (let i = 0; i < mergedPeriods.length - 1; i++) {
      if (
        mergedPeriods[i].end >= crimeStart &&
        mergedPeriods[i + 1].start <= crimeEnd &&
        mergedPeriods[i + 1].start - mergedPeriods[i].end >= crimeDuration
      ) {
        hasAlibi = false;
      }
    }

    // Check after last activity
    if (mergedPeriods[mergedPeriods.length - 1].end < crimeEnd && mergedPeriods[mergedPeriods.length - 1].end + crimeDuration <= crimeEnd) {
      hasAlibi = false;
    }

    return { suspect: index + 1, alibi: hasAlibi };
  });
}


