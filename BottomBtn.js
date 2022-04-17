import React , { useState , useEffect , useRef } from "react"
import { FontAwesomeIcon  } from "@fortawesome/react-fontawesome"
import PropTypes from 'prop-types'


const BottomBtn = ({ text , colorClass , icon , onBtnClick }) =>(
    <button
        type="button"
        className={`btn btn-block no-border ${colorClass}`}
        onClick={onBtnClick}
    >
        <FontAwesomeIcon 
            className="me-2"
            size="lg"                              
            icon={icon} 
        />
        {text}

    </button>
)

BottomBtn.propTypes = {
    text:PropTypes.string,
    colorClass:PropTypes.string,
    icon:PropTypes.object,
    onBtnClick:PropTypes.func,
}
BottomBtn.defaultProps={
    text:'New'
}
export default BottomBtn