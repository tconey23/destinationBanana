import { LinkButton } from "./LinkIcon.styled"


function LinkIcon({ id, focusPage }) {
    return (
        <LinkButton onClick={() => {
            focusPage(id)
        }}>
            <img src='/assets/link-icon.svg' alt='time travel link icon'/>
        </LinkButton>
    )
}

export default LinkIcon