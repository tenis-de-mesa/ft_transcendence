import { DataTable } from "../components/DataTable";
import { Typography } from "../components/Typography";
import { tableData } from "../data";

const Leaderboard = () => {
  return (
    <>
      <Typography variant="h5">
        Leaderboard
      </Typography>

      <div className="h-[92%]">
        <DataTable dataset={tableData} />
      </div>
    </>
  )
};

export default Leaderboard;