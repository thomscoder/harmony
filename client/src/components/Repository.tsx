import Branches from "./Branches"
import Commit from "./Commits"

const Repository = ({changeFilesOnCheckout}: {changeFilesOnCheckout: any}) => {
    return (
        <>
        <Commit />
        <Branches changeFilesOnCheckout={changeFilesOnCheckout} />
        </>
    )
}

export default Repository