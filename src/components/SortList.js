import React, { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import useKeyPress from "../Hook/useKeyPress"
import 'bootstrap/dist/css/bootstrap.min.css'

const SortList = ({ sorts, onSortClick, onSortDelete, onSaveSort }) => {
    const [editSortStatus, setEditSortStatus] = useState(false) //save the id of item which is being edited
    const [sortValue, setSortValue] = useState('')
    const [sortDescription, setSortDescription] = useState('')
    const enterPressed = useKeyPress(13);
    const escPressed = useKeyPress(27);
    const closeEdit = (editItem) => {
        setEditSortStatus(false)
        setSortValue('')
        setSortDescription('')
        if (editItem.isNew) {
            onSortDelete(editItem.id)
        }

    }
    useEffect(() => {
        const editItem = sorts.find(sort => sort.id === editSortStatus);
        if (enterPressed && editSortStatus && sortValue.trim() != '') {
            onSaveSort(editItem.id, sortValue, sortDescription, editItem.isNew);
            setEditSortStatus(false);

        }
        if (escPressed && editSortStatus) {
            closeEdit(editItem)
        }
    })
    useEffect(() => {
        const newSort = sorts.find(sort => sort.isNew)
        //console.log(newTodo)
        if (newSort) {
            setEditSortStatus(newSort.id)
            setSortValue(newSort.sortName)
            setSortDescription(newSort.sortDescription)

        }
    }, [sorts])
    return (
        <div className="row sort-list">
            {
                sorts.map(sort => (
                    <div
                        className=" card c-link sort-item p-0"
                        key={sort.id}
                    >
                        {((sort.id !== editSortStatus) && !sort.isNew) &&
                            <>
                                <div className="card-header p-0">
                                    <button
                                        text=""
                                        type="button"
                                        className="icon-button"
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="bottom"
                                        title="Delete"
                                        onClick={() => { onSortDelete(sort.id) }}>
                                        <FontAwesomeIcon
                                            icon={faTimes} />
                                    </button>
                                </div>

                                <div className="card-body text-center"
                                    
                                    onClick={() => {
                                        onSortClick(sort.id);
                                        setEditSortStatus(sort.id);
                                        setSortValue(sort.sortName);
                                        setSortDescription(sort.sortDescription)
                                    }}>

                                    <h5
                                        className="card-title"
                                    >
                                        {sort.sortName}
                                    </h5>
                                    <h6 className="card-subtitle mb-2 text-muted">{sort.sortDescription}</h6>



                                </div>
                            </>
                        }
                        {((sort.id === editSortStatus) || sort.isNew) &&
                            <>
                                <div className="card-header p-0">
                                    <button
                                        text=""
                                        type="button"
                                        className="icon-button"
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="bottom"
                                        title="Cancel"
                                        onClick={() => { closeEdit(sort) }}>
                                        <FontAwesomeIcon
                                            icon={faTimes} />
                                    </button>
                                </div>
                                <div className="card-body">
                                    <label className="">

                                        <strong>Sort Name</strong>

                                    </label>

                                    <input
                                        placeholder="Sort Name"
                                        className="form-control"
                                        value={sortValue}
                                        onChange={(e) => { setSortValue(e.target.value) }} />

                                    <label className="">
                                        <strong>Sort Description</strong></label>
                                    <input
                                        placeholder="Sort Description"
                                        type="text"
                                        //ref={node}
                                        className="form-control"
                                        value={sortDescription}
                                        //ref={node}
                                        onChange={(e) => { setSortDescription(e.target.value) }} />
                                </div>
                            </>
                        }

                    </div>)

                )
            }
        </div>
    )
}
SortList.propTypes = {
    sorts: PropTypes.array,
    onSortDelete: PropTypes.func,
    onSaveSort: PropTypes.func,
}
export default SortList