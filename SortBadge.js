import React, { useState, useEffect, useRef } from "react"
import classNames from 'classnames'
import PropTypes from 'prop-types'
import './SortBadge.scss'
import 'bootstrap/dist/css/bootstrap.min.css'
import BottomBtn from './BottomBtn'

import { faAngleDown } from '@fortawesome/free-solid-svg-icons'


const SortBadge = ({ sorts, activeSortName, onSortBadgeClick }) => {
    return (
        <div className="dropdown ">
            <button className="btn btn-block no-border dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                {activeSortName}
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">

                <li>
                    {sorts.map(sort => (

                        <a key={sort.id} className="dropdown-item" onClick={(e) => { e.preventDefault(); onSortBadgeClick(sort.id) }}>{sort.sortName}</a>

                    )

                    )



                    }

                </li>
            </ul>
        </div>

    )
}

SortBadge.propTypes = {
    sorts: PropTypes.array,
    activeSortName: PropTypes.string,
    onSortClick: PropTypes.func,
}
export default SortBadge