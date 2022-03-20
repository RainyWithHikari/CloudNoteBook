import React, { useState, useEffect, useRef } from "react"
import PropTypes from 'prop-types'
import defaultTodos from '../utils/defaultTodo'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleCheck, faPenToSquare, faTimes } from '@fortawesome/free-solid-svg-icons'
import BottomBtn from './BottomBtn'
import useKeyPress from "../Hook/useKeyPress"
import 'bootstrap/dist/css/bootstrap.min.css'
import './TodoList.scss'

const bootstrap = window.require('bootstrap')
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})
const TodoList = ({ todos, onEventClick, onEventDelete, onSaveEvent }) => {
    const [editEventStatus, setEditEventStatus] = useState(false) //save the id of item which is being edited
    const [EventValue, setEventValue] = useState('')
    const [EventDate, setEventDate] = useState('')
    const [EventImportance, setEventImportance] = useState('')
    const [EventDetails, setEventDetails] = useState('')
    let node = useRef(null)
    const enterPressed = useKeyPress(13);
    const escPressed = useKeyPress(27);


    const closeEdit = (editItem) => {

        setEditEventStatus(false)
        setEventValue('')
        setEventDate('')
        setEventImportance('')
        if (editItem.isNew) {
            onEventDelete(editItem.id)
        }

    }
    useEffect(() => {
        const editItem = todos.find(todo => todo.id === editEventStatus);
        if (enterPressed && editEventStatus && EventValue.trim() != '' && EventImportance.trim() != '') {
            onSaveEvent(editItem.id, EventDate, EventValue, EventImportance, EventDetails, editItem.isNew);
            setEditEventStatus(false);

        }
        if (escPressed && editEventStatus) {
            closeEdit(editItem)
        }
    })
    useEffect(() => {
        const newTodo = todos.find(todo => todo.isNew)
        //console.log(newTodo)
        if (newTodo) {
            setEditEventStatus(newTodo.id)
            setEventValue(newTodo.todo)
            setEventDate(newTodo.dueDate)
            setEventImportance(newTodo.importance)
            setEventDetails(newTodo.details)

        }
    }, [todos])
    return (
        <ul className="row list-group list-group-flush todo-list">
            {
                todos.map(todo => (
                    <li
                        className=" list-group-item c-link todo-item"
                        key={todo.id}>
                        {((todo.id !== editEventStatus) && !todo.isNew) &&
                            <>
                                <div className="row p-0">
                                    <div className="col-1"></div>
                                    <button
                                        type="button"
                                        className="icon-button col-2 p-0 text-center"
                                        onClick={() => {
                                            setEditEventStatus(todo.id);
                                            setEventDate(todo.dueDate);
                                            setEventValue(todo.todo);
                                            setEventImportance(todo.importance);
                                            setEventDetails(todo.details)
                                        }}
                                    //onClick={() => { seteditEventStatus(todo.id); setEventValue(todo.todo);setEventDate(todo.dueDate) ;setEventImportance(todo.importance)}}
                                    >
                                        <FontAwesomeIcon
                                            className=""
                                            data-bs-toggle="tooltip"
                                            data-bs-placement="bottom"
                                            title="Edit"
                                            size="lg"
                                            icon={faPenToSquare} />
                                    </button>
                                    <span
                                        className="col-7"
                                        onClick={() => {
                                            onEventClick(todo.id)
                                        }}>
                                        {todo.todo}
                                    </span>

                                    <button
                                        type="button"
                                        className="icon-button complete-icon col-2 p-0"
                                        onClick={() => { onEventDelete(todo.id) }}>
                                        <FontAwesomeIcon
                                            className="ms-2"
                                            data-bs-toggle="tooltip"
                                            data-bs-placement="bottom"
                                            title="Done"
                                            size="lg"
                                            icon={faCircleCheck} />
                                    </button>
                                </div>
                            </>
                        }
                        {((todo.id === editEventStatus) || todo.isNew) &&
                            <>
                                <div className="row gy-2">
                                    <label className="">
                                        <strong>DueDate</strong>
                                    </label>

                                    <input
                                        placeholder="xxxx-xx-xx"
                                        className="form-control"
                                        value={EventDate}
                                        onChange={(e) => { setEventDate(e.target.value) }} />

                                    <label className="">
                                        <strong>Summary</strong></label>
                                    <input
                                        placeholder="summary title"
                                        type="text"
                                        ref={node}
                                        className="form-control"
                                        value={EventValue}
                                        //ref={node}
                                        onChange={(e) => { setEventValue(e.target.value) }} />
                                    <label className="">
                                        <strong>Urgency</strong></label>
                                    <select
                                        className="form-select"
                                        id="inputGroupSelect01"
                                        onChange={(e) => { setEventImportance(e.target.value) }}
                                    >
                                        <option defaultValue={EventImportance}>{EventImportance}</option>
                                        <option value="urgent" >Urgent</option>
                                        <option value="normal">Normal</option>
                                        <option value="low">Low</option>
                                    </select>

                                    <label className="">
                                        <strong>Details</strong></label>
                                    <textarea
                                        className="form-control"
                                        value={EventDetails}
                                        onChange={(e) => { setEventDetails(e.target.value) }}
                                    ></textarea>
                                    <BottomBtn
                                        className=""
                                        text=""
                                        icon={faTimes}
                                        colorClass="btn-outline-secondary"
                                        onBtnClick={() => { closeEdit(todo) }}
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
TodoList.propTypes = {
    todos: PropTypes.array,
    onEventClick: PropTypes.func,
    onEventDelete: PropTypes.func,
    onSaveEvent: PropTypes.func,

}
export default TodoList