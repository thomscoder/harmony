import GitGraph from './GitGraph';
import BranchSwitcher from './BranchSwitcher';

const GitGraphWrapper = () => {
  return (
    <>
      <div className="graph-mode-container">
        <strong>Graph</strong>
        <div className="graph-actions">
          <BranchSwitcher />
          <GitGraph />
        </div>
      </div>
    </>
  );
};

export default GitGraphWrapper;
