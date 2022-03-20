import React, { useState, useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit, faTrash, faFolder, faTimes } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import useKeyPress from "../Hook/useKeyPress"


const FolderList = ({ folders, onFolderClick, onFolderEdit, onFolderDelete }) => {
    //use a var to identify which one is being edited
    const [editFolderStatus, setEditFolderStatus] = useState(false)
    const [folderValue, setFolderValue] = useState('')
    const enterPressed = useKeyPress(13);
    const escPressed = useKeyPress(27);

    //Cancel edit folder name
    const closeEdit = (editItem) => {
        setEditFolderStatus(false)
        setFolderValue('')
        //if we are editing a new folder, we need to delete it
        if (editItem.isNew) {
            onFolderDelete(editItem.id)
        }
    }

    //keyPress shortCuts
    useEffect(() => {
        const editItem = folders.find(folder => folder.id === editFolderStatus);
        if (enterPressed && editFolderStatus && folderValue.trim() !== '') {
            console.log(folderValue)

            onFolderEdit(editItem.id, folderValue, editItem.isNew);
            setEditFolderStatus(false);
            setFolderValue('');
        }
        if (escPressed && editFolderStatus) {
            closeEdit(editItem)
        }
    })
    return (
        <ul className="nav flex-column folder-list" >

            {
                folders.map(folder => (

                    <li className="nav-item d-flex align-items-center folder-item c-link" key={folder.id}>
                        {(folder.id !== editFolderStatus) &&
                            <>
                                <span className=" text-center " >
                                    <FontAwesomeIcon
                                        size="lg"
                                        icon={faFolder} />
                                </span>
                                <span className="nav-link " onClick={() => { onFolderClick(folder.id) }}>{folder.name}</span>
                                <button
                                    type="button"
                                    className=" icon-button btn-outline-secondary"
                                    onClick={() => { setEditFolderStatus(folder.id); setFolderValue(folder.name) }}
                                //onBtnClick={createNewFile}
                                >
                                    edit
                                </button>
                                <button
                                    type="button"
                                    className=" icon-button btn-outline-secondary"
                                    onClick={() => { onFolderDelete(folder.id) }}
                                //onBtnClick={createNewFile}
                                >
                                    delete
                                </button>
                            </>
                        }
                        {(folder.id === editFolderStatus) &&
                            <>
                                <span className=" text-center " >
                                    <FontAwesomeIcon
                                        size="lg"
                                        icon={faFolder} />
                                </span>


                                <input
                                    className="form-control"
                                    value={folderValue}

                                    onChange={(e) => { setFolderValue(e.target.value) }}
                                />




                            </>

                        }



                    </li>
                ))

            }
        </ul>
    )
}
FileList.propTypes = {
    folders: PropTypes.array,
    onFolderClick: PropTypes.func,
    onFolderDelete: PropTypes.func,
    onFolderEdit: PropTypes.func,
    // editItem:PropTypes.func,
}
export default FolderList