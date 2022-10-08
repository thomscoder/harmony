import { createGitgraph, templateExtend } from '@gitgraph/js';
import { useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { actionState, gitFootPrintsState, virtualFilesState } from '../../atoms/atoms';
import { gitFootPrintType } from '../../types/types';
import { getVirtualFilesWrapper, goToCommitWrapper } from '../../utils/goFunctions';

const GitGraph = () => {
  const gitFootPrints = useRecoilValue(gitFootPrintsState);
  const setVirtualFiles = useSetRecoilState(virtualFilesState);
  const setAction = useSetRecoilState(actionState);

  const clickOnCommitHandler = (hash: string | undefined) => {
    if (!!hash) {
      goToCommitWrapper(hash);
      setVirtualFiles(getVirtualFilesWrapper());
      setAction('');
    }
  };

  useEffect(() => {
    const graphContainer = document.getElementById('graph') as HTMLDivElement;
    const gitgraph = createGitgraph(graphContainer, {
      responsive: true,
      // @ts-ignore
      template: new templateExtend('metro', {
        branch: {
          lineWidth: 3,
          label: {
            borderRadius: 0,
            bgColor: 'white',
            strokeColor: 'black',
            color: 'black',
            font: 'normal 10pt Arial',
          },
        },
        commit: {
          dot: {
            size: 12,
          },
          message: {
            font: 'normal 10pt Arial',
            displayAuthor: false,
          },
        },
        colors: ['#d5a5f7', '#44d6ff', '#ffac4b', '#ff5b9b', '#d7d2d8', '#12fcd4', '#004a98'],
      }),
      author: 'Nova Harmony <nova@harmony.com>',
    });

    gitFootPrints.forEach((footPrint: gitFootPrintType) => {
      gitgraph.branch(footPrint.branch).commit({
        hash: footPrint.commit?.hash ?? '',
        subject: footPrint.commit?.message ?? 'Checkout',
        onClick: () => clickOnCommitHandler(footPrint.commit.hash),
        onMessageClick: () => clickOnCommitHandler(footPrint.commit.hash),
        style: {
          color: '#1e1e1e',
          message: {
            color: '#fff',
            displayHash: !!footPrint.commit.hash,
          },
        },
      });
    });
  }, []);

  return (
    <div className="graph-mode-wrapper">
      <div id="graph"></div>
    </div>
  );
};

export default GitGraph;
