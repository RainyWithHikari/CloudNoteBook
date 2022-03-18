import React, { useState, useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit, faTrash, faFile, faTimes } from '@fortawesome/free-solid-svg-icons'
import { getParentNode } from '../utils/helper'
import PropTypes from 'prop-types'
import useKeyPress from "../Hook/useKeyPress"
import './FileList.scss'
import useContentMenu from "../Hook/useContextMenu"

const remote = window.require('@electron/remote')
const { Menu, MenuItem } = remote

const FileList = ({
    files, onFileClick, onSaveEdit, onFileDelete
}) => {
    const [editStatus, setEditStatus] = useState(false)
    const [value, setValue] = useState('')
    //const [sort, setSortValue] = useState('')
    const enterPressed = useKeyPress(13)
    const escPressed = useKeyPress(27)
    let node = useRef(null);

    const closeSearch = (editItem) => {
        setEditStatus(false)
        setValue('')
        //setSortValue('')
        //if we are editing a new file, we need to delete it
        if (editItem.isNew) {
            onFileDelete(editItem.id)
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
            label: 'Rename',
            click: () => {
                const parentElement = getParentNode(clickedItem.current, 'file-item')
                if (parentElement) {
                    const { id, title } = parentElement.dataset
                    setEditStatus(id)
                    setValue(title)
                }
            }
        },

        {
            label: 'Delete',
            click: () => {
                const parentElement = getParentNode(clickedItem.current, 'file-item')
                if (parentElement) {
                    onFileDelete(parentElement.dataset.id)
                }
            }
        }
    ], '.file-list', [files])

    //keyboard event
    useEffect(() => {
        const editItem = files.find(file => file.id === editStatus);
        if (enterPressed && editStatus && value.trim() !== '') {
            //console.log(sort)

            onSaveEdit(editItem.id, value, editItem.isNew)//onSaveEdit(editItem.id, value,sort, editItem.isNew)
            //onsaveEdit2(editItem.id, sort, editItem.isNew)
            setEditStatus(false)
            setValue('')
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
            //setSortValue(newFile.sort)
        }
    }, [files])

     useEffect(() => {
         if (editStatus) {
             node.current.focus()

         }

     }, [editStatus])


    return (
        <ul className="row list-group list-group-flush file-list">
            
            {
                files.map(file => (
                    <li
                        className="list-group-item  justify-content-between d-flex align-items-center file-item mx-0"
                        key={file.id}
                        data-id={file.id}
                        data-title={file.title}
                    >
                        {(file.id !== editStatus && !file.isNew) &&
                            <>
                                <span className="col-4 text-center">
                                    <FontAwesomeIcon
                                        size="lg"
                                        icon={faFile} />
                                </span>

                                <span
                                    className="col-8 c-link"
                                    onClick={() => {
                                        onFileClick(file.id)
                                    }}>{file.title}
                                </span>
                            </>
                        }

                        {
                            ((file.id === editStatus) || file.isNew) &&
                            <>
                                <span className="me-2">
                                    <FontAwesomeIcon
                                        size="lg"
                                        icon={faFile} />
                                </span>


                                <input
                                    className="form-control"
                                    value={value}
                                    ref={node}
                                    onChange={(e) => { setValue(e.target.value) }}
                                />

                                <button
                                    type="button"
                                    className="btn-close ms-2"
                                    aria-label="Close"
                                    onClick={() => { closeSearch(file) }}
                                >

                                </button>
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