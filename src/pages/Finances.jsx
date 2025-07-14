import CurrentBalance from "../components/CurrentBalance";
import Income from "../components/dashboard/Income";
import TotalWithdraw from "../components/TotalWithdraw";

const Finances = () => {
  return (
    <div className="p-8">
      <Income />
      <TotalWithdraw />
      <CurrentBalance />
    </div>
  );
};

export default Finances;
