import React, { useState, useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit, faTrash, faFile, faTimes } from '@fortawesome/free-solid-svg-icons'
import { getParentNode } from '../utils/helper'
import PropTypes from 'prop-types'
import useKeyPress from "../Hook/useKeyPress"
import './FileList.scss'
import useContentMenu from "../Hook/useContextMenu"
import BottomBtn from './BottomBtn'

const remote = window.require('@electron/remote')
const { Menu, MenuItem } = remote

const FileList = ({
    files, onFileClick, onSaveEdit, onFileDelete, sorts
}) => {
    const [editStatus, setEditStatus] = useState(false)
    const [value, setValue] = useState('')
    const [sortValue, setSortValue] = useState('')
    const enterPressed = useKeyPress(13)
    const escPressed = useKeyPress(27)
    let node = useRef(null);

    const closeSearch = (editItem) => {
        setEditStatus(false)
        setValue('')
        setSortValue('')
        //setSortValue('')
        //if we are editing a new file, we need to delete it
        if (editItem.isNew) {
            onFileDelete(editItem.id, editItem.sort)
        }
    }

    const clickedItem = useContentMenu([
        {
            label: 'Open',
            click: () => {

                //上浮到父元素，获取文档id
                const parentElement = getParentNode(clickedItem.current, 'file-item')
                if (parentElement) {
                    onFileClick(parentElement.dataset.id)
                }


            }
        },
        {
            label: 'Edit',
            click: () => {
                const parentElement = getParentNode(clickedItem.current, 'file-item')
                if (parentElement) {
                    const { id, title, sort } = parentElement.dataset
                    setEditStatus(id)
                    setValue(title)
                    setSortValue(sort)
                }
            }
        },

        {
            label: 'Delete',
            click: () => {
                const parentElement = getParentNode(clickedItem.current, 'file-item')
                if (parentElement) {
                    onFileDelete(parentElement.dataset.id, parentElement.dataset.sort)
                }
            }
        }
    ], '.file-list', [files])

    //keyboard event
    useEffect(() => {
        const editItem = files.find(file => file.id === editStatus);
        if (enterPressed && editStatus && value.trim() !== '') {
            //console.log(sort)

            onSaveEdit(editItem.id, value, sortValue, editItem.isNew)//onSaveEdit(editItem.id, value,sort, editItem.isNew)
            //onsaveEdit2(editItem.id, sort, editItem.isNew)
            setEditStatus(false)
            //setValue('')
            //setSortValue('')
        }
        if (escPressed && editStatus) {
            closeSearch(editItem)
        }
    })
    useEffect(() => {
        const newFile = files.find(file => file.isNew)
        //console.log(newFile)
        if (newFile) {
            setEditStatus(newFile.id)
            setValue(newFile.title)
            setSortValue(newFile.sort)
            //setSortValue(newFile.sort)
        }
    }, [files])

    // useEffect(() => {
    //     if (editStatus) {
    //         node.current.focus()

    //     }

    // }, [editStatus])


    return (
        <ul className="row list-group list-group-flush file-list">

            {
                files.map(file => (
                    <li
                        className="list-group-item  justify-content-between d-flex align-items-center file-item mx-0"
                        key={file.id}
                        data-id={file.id}
                        data-title={file.title}
                        data-sort={file.sort}
                        data-bs-toggle="tooltip"
                        data-bs-placement="bottom"
                        title={file.path}
                    >
                        {(file.id !== editStatus && !file.isNew) &&
                            <>
                                <span className="col-2 text-center">
                                    <FontAwesomeIcon
                                        size="lg"
                                        icon={faFile} />
                                </span>
                                <span
                                    className="col-10 c-link"
                                    onClick={() => {
                                        onFileClick(file.id)
                                    }}><span className="text-muted">{file.sort}</span><label>&gt;</label><strong>{file.title}</strong>
                                </span>
                            </>
                        }

                        {
                            ((file.id === editStatus) || file.isNew) &&
                            <>

                                <div className="row gy-2">
                                    <label className="fileName-label">

                                        <strong>File Name</strong>

                                    </label>
                                    <input
                                        className="form-control"
                                        value={value}
                                        //ref={node}
                                        onChange={(e) => { setValue(e.target.value) }}
                                    />
                                    <label className="sort-label">

                                        <strong>Sort</strong>

                                    </label>
                                    {/* <input
                                        className="form-control"
                                        value={sortValue}
                                        //ref={node}
                                        onChange={(e) => { setSortValue(e.target.value) }}
                                    /> */}
                                    <select
                                        className="form-select"
                                        id="inputGroupSelect01"
                                        onChange={(e) => { setSortValue(e.target.value) }}
                                    >
                                        <option

                                            placeholder={sortValue}
                                            value={sortValue} >{sortValue}</option>
                                        {
                                            sorts.map(sort => (
                                                <option
                                                    key={sort.id}

                                                    value={sort.sortName} >{sort.sortName}</option>

                                            ))
                                        }

                                    </select>
                                    <BottomBtn
                                        className=""
                                        text=""
                                        icon={faTimes}
                                        colorClass="btn-outline-secondary"

                                        onBtnClick={() => { closeSearch(file) }}
                                    />

                                </div>

                            </>
                        }

                    </li>
                ))
            }
        </ul>
    )
}

FileList.propTypes = {
    onFileClick: PropTypes.func,
    onFileDelete: PropTypes.func,
    editItem: PropTypes.func,
}

export default FileList;