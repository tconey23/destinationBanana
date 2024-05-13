import { StyledLandingButton } from "./LandingButton.styled"


export default function LandingButton({ 
    goToPage, 
    buttonName, 
    buttonAlt, 
    backgroundColor, 
    boxShadow,
    setBtnDesc,
    description
}) {

    return (
        <StyledLandingButton 
            onClick={goToPage}
            backgroundColor={backgroundColor} 
            boxShadow={boxShadow}
            onMouseEnter={() => {
                if (typeof setBtnDesc === 'function') {
                  setBtnDesc(description);
                }
            }}
        >
            {/* <img src={`/assets/buttons/${buttonName}.svg`} alt={buttonAlt} /> */}
            <p>{buttonName}</p>
        </StyledLandingButton>
    )

}