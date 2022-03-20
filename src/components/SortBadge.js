import React, { useState, useEffect, useRef } from "react"
import classNames from 'classnames'
import PropTypes from 'prop-types'
import './SortBadge.scss'
import 'bootstrap/dist/css/bootstrap.min.css'
import BottomBtn from './BottomBtn'

import { faAngleDown} from '@fortawesome/free-solid-svg-icons'


const SortBadge = ({ sorts, activeSortName, onSortBadgeClick }) => {
    return (
        <div>
            {sorts.map(sort => (

                <div className="row" key={sort.id} >
                    <BottomBtn
                        colorClass='btn-outline-secondary'
                        text={sort.sortName}
                        icon={faAngleDown}
                        onBtnClick={(e) => { e.preventDefault(); onSortBadgeClick(sort.sortName) }}>

                    </BottomBtn>


                </div>


            )

            )



            }

        </div>


    )
}

SortBadge.propTypes = {
    sorts: PropTypes.array,
    activeSortName: PropTypes.string,
    onSortClick: PropTypes.func,
}
export default SortBadge