
import {createGitgraph} from '@gitgraph/js';
import { useEffect, useState } from "react";
import {useRecoilValue } from "recoil";
import { gitFootPrintState} from "../../atoms/atoms";
import { gitFootPrintType } from '../../types/types';
import "../styles/GitGraph.css";

const GitGraph = () => {
    const gitFootPrint = useRecoilValue(gitFootPrintState);

    // @ts-ignore
    const [graph, setGraph] = useState<GitgraphUserApi<SVGElement>>();

    useEffect(() => {
        const graphContainer = document.getElementById('graph') as HTMLDivElement;
        const gitgraph = createGitgraph(graphContainer, {
            responsive: true,
        });
        gitFootPrint.forEach((footPrint: gitFootPrintType) => {
            gitgraph.branch(footPrint.branch).commit({
                hash: footPrint.commit?.hash,
                body: footPrint.commit?.message,
            })
        })
    }, [])



    return (
        <>
            <div id="graph">
            </div>
        </>
    )
}


export default GitGraph;