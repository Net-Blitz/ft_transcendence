export interface DataTable {
	gameMode: string;
	team: { img: string; level: number }[];
	date: string;
	hour: string;
	score: number[];
	difficulty: string;
	map: string;
	watch: string;
}
  
export interface MatchesInProgressProps {
	header: string[];
	data: DataTable[];
	dataGame: (data: DataTable, index: number) => JSX.Element;
}