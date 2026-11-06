import fs from 'fs';

const BASE_URL = 'https://smv.tyler.place/api/telemetry';
const TRIP_ID = 650513106;
const headers = [
	'id',
	'tripId',
	'time',
	'tempMosfet',
	'tempMotor',
	'motorCurrent',
	'inputCurrent',
	'dutyCycle',
	'tacho',
	'volts',
	'wattHours',
	'error',
	'lat',
	'long',
	'heading',
	'editedAt',
];

const ws = fs.createWriteStream(`${TRIP_ID}.csv`);
ws.write(headers.join(',') + '\n');

let lastEdited = 0;
let resultCount = 100;
while (resultCount >= 100) {
	const res = await fetch(`${BASE_URL}/${TRIP_ID}?max=100&updatedAfter=${lastEdited}`);
	if (!res.ok) throw new Error(await res.text());
	const json = (await res.json()) as Record<string, string | number>[];

	for (const row of json) ws.write(headers.map((key) => row[key] || '').join(',') + '\n');

	resultCount = json.length;
	if (json.length > 0) lastEdited = json[json.length - 1].editedAt as number;
	console.log(`Fetched ${json.length} rows, editedAt=${lastEdited}`);
}

await new Promise((resolve) => ws.end(resolve));
console.log('done');
