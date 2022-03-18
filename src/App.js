//common
import React, { useState } from 'react'
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/bootstrap-icons.svg'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faFileImport, faSave, faFileExport, faCopy, faSearch, faDiagramSuccessor, faClipboardCheck, faUserCircle } from '@fortawesome/free-solid-svg-icons'

//markdown editor
import SimpleMDE from "react-simplemde-editor"
import "easymde/dist/easymde.min.css"

//uuid
import { v4 as uuidv4 } from 'uuid'
//markmap
import { Transformer } from 'markmap-lib';
import * as markmap from 'markmap-view';

//components
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import BottomBtn from './components/BottomBtn'
import TabList from './components/TabList'
import TodoList from './components/TodoList'
import TodoCard from './components/TodoCard';
import FolderList from './components/FolderList'
import FolderTab from './components/FolderTab';

//utils
import fileHelper from './utils/fileHelper'
import { flattenArr, objToArr } from './utils/helper'
import FileHelper from './utils/fileHelper'


//require node.js modules
const { join, basename, extname, dirname } = window.require('path')
const remote = window.require('@electron/remote')
const Store = window.require('electron-store')
const fileStore = new Store({ 'name': 'Files Data' })
const todoStore = new Store({ 'name': 'todos data' })
const bootstrap = window.require('bootstrap')

//use JavaScript to change tabs
var triggerTabList = [].slice.call(document.querySelectorAll('#myTab button'))
triggerTabList.forEach(function (triggerEl) {
  var tabTrigger = new bootstrap.Tab(triggerEl)

  triggerEl.addEventListener('click', function (event) {
    event.preventDefault()
    tabTrigger.show()
  })
})

//store Files into local dir
const saveFilesToStore = (files) => {
  //no need to store all the info into the system.
  const fileStoreObj = objToArr(files).reduce((result, file) => {
    const { id, path, title, createdAt } = file//const { id , path , title , createdAt , sort} = file
    result[id] = {
      id,
      path,
      title,
      createdAt,

    }
    return result
  }, {})
  fileStore.set('files', fileStoreObj)
}
//store todos into local dir
const saveTodosToStore = (todos) => {
  const todoStoreObj = objToArr(todos).reduce((result, todoEvent) => {
    const { id, path, todo, dueDate, importance, details } = todoEvent
    result[id] = {
      id,
      path,
      todo,
      dueDate,
      importance,
      details,
    }
    return result

  }, {})
  todoStore.set('todos', todoStoreObj)
}

function App() {


  //setup the state of Todo Lists
  const [todos, setTodos] = useState(todoStore.get('todos') || {})
  const [openedTodoIDs, setOpenedTodoIDs] = useState([])
  const [activeTodoID, setActiveTodoID] = useState('')
  const todoArr = objToArr(todos)
  const openedTodos = openedTodoIDs.map(openTodoID => {
    return todos[openTodoID]
  })
  const activeTodo = todos[activeTodoID]

  //setup the state of Files
  const [files, setFiles] = useState(fileStore.get('files') || {})
  const [activeFileID, setActiveFileID] = useState('')
  const [openedFileIDs, setOpenedFileIDs] = useState([])
  const [unsavedFileIDs, setUnsavedFileIDs] = useState([])
  const [searchedFiles, setSearchedFiles] = useState([])


  const transformer = new Transformer();
  const { Markmap, loadCSS, loadJS } = markmap;
  const exec = window.require('child_process').exec

  const filesArr = objToArr(files)
  const savedLocation = remote.app.getPath('documents')
  const savedTodoLocation = remote.app.getPath('userData')
  const activeFile = files[activeFileID]
  const openedFiles = openedFileIDs.map(openID => {
    return files[openID]
  })
  const fileListArr = (searchedFiles.length > 0) ? searchedFiles : filesArr



  //use cmd to transform .md file to mindmap file
  const startCMD = () => {
    let cmdStr1 = `npx markmap-cli ${activeFile.path}`//'npx markmap-cli C:\\Users\\anhko\\Documents\\new2.md'//npx markmap-cli C:\Users\anhko\Documents\new2.md
    let cmdPath = ''
    let workerProcess
    runExec(cmdStr1)
    function runExec(cmdStr) {
      workerProcess = exec(cmdStr, { cwd: cmdPath })
      workerProcess.stdout.on('data', function (data) {
        console.log('stdout:' + data)
      })
      workerProcess.stderr.on('data', function (data) {
        console.log('stderr: ' + data)
      })
      workerProcess.on('close', function (code) {
        console.log('out code：' + code)
      })
    }
  }

  const MarkPhraser = () => {
    runMarkmap(activeFile.body)
    function runMarkmap(markdown) {
      const { root, features } = transformer.transform(markdown);
      const { styles, scripts } = transformer.getUsedAssets(features);
      if (styles) loadCSS(styles);
      if (scripts) loadJS(scripts, { getMarkmap: () => markmap });
      Markmap.create('.editor-preview', root);
    }

  }

  //functions of files
  const fileClick = (fileID) => {
    // set current active file
    setActiveFileID(fileID)
    const currentFile = files[fileID]
    if (!currentFile.isLoaded) {
      fileHelper.readFile(currentFile.path).then(value => {
        const newFile = { ...files[fileID], body: value, isLoaded: true }
        setFiles({ ...files, [fileID]: newFile })
      })
    }
    if (!openedFileIDs.includes(fileID)) {
      setOpenedFileIDs([...openedFileIDs, fileID])
    }
  }
  const fileChange = (id, value) => {

    const newFile = { ...files[id], body: value }
    setFiles({ ...files, [id]: newFile })
    // update unsavedIDs
    if (!unsavedFileIDs.includes(id)) {
      setUnsavedFileIDs([...unsavedFileIDs, id])
    }

  }
  const deleteFile = (id) => {
    if (files[id].isNew) {
      const { [id]: value, ...afterDelete } = files
      setFiles(afterDelete)
    } else {
      fileHelper.deleteFile(files[id].path).then(() => {
        const { [id]: value, ...afterDelete } = files
        setFiles(afterDelete)
        saveFilesToStore(afterDelete)
        tabClose(id)
      })
    }
  }
  const updateFileName = (id, title, isNew) => {
    //信息持久化
    //if inNew is false , path will be old dir + newTitle
    const newPath = isNew ? join(savedLocation, `${title}.md`) : join(dirname(files[id].path), `${title}.md`)
    const modifiedFile = { ...files[id], title, isNew: false, path: newPath }
    const newFiles = { ...files, [id]: modifiedFile }
    if (isNew) {
      //判断文件是否存在，如果不存在，新建md文件
      fileHelper.writeFile(newPath, files[id].body).then(() => {
        setFiles(newFiles)
        //数据持久化
        saveFilesToStore(newFiles)
      })
    } else {
      const oldPath = files[id].path
      //如果存在，修改文件名
      fileHelper.renameFile(oldPath, newPath).then(() => {
        setFiles(newFiles)
        //数据持久化
        saveFilesToStore(newFiles)
      })

    }
  }
  const createNewFile = () => {
    const newID = uuidv4() //通用唯一识别码
    const newFile = {
      id: newID,
      title: '',
      body: '## Markdown',
      createdAt: new Date().getTime(),
      isNew: true,
    }
    setFiles({ ...files, [newID]: newFile })
  }
  const fileSearch = (keyword) => {
    // filter out the new files based on the keyword
    const newFiles = filesArr.filter(file => file.title.includes(keyword))
    setSearchedFiles(newFiles)
  }
  const saveCurrentFile = () => {
    //save files to original path
    FileHelper.writeFile(activeFile.path, activeFile.body).then(() => {
      setUnsavedFileIDs(unsavedFileIDs.filter(id => id != activeFile.id))
    })
  }
  const importFiles = () => {
    remote.dialog.showOpenDialog({
      title: '请选择导入的Markdown文件',
      filters: [{
        name: 'Markdown',
        extensions: ['md']
      }
      ],
      properties: ['openFile', 'multiSelections'],

    }).then(result => {
      if (Array.isArray(result.filePaths)) {
        //filter out the path we've already opened in app
        const filteredPaths = result.filePaths.filter(path => {
          const alreadyAdded = Object.values(files).find(file => {
            return file.path === path
          })
          return !alreadyAdded
        })
        const importFilesArr = filteredPaths.map(path => {
          return {
            id: uuidv4(),
            title: basename(path, extname(path)),
            path,
            //sort:basename(path , extname(path)),


          }
        })
        //console.log(importFilesArr)
        //get the new files object in flattenArr
        const newFiles = { ...files, ...flattenArr(importFilesArr) }
        //console.log(newFiles)
        //setState and update store
        setFiles(newFiles)
        saveFilesToStore(newFiles)
        if (importFilesArr.length > 0) {
          remote.dialog.showMessageBox({
            type: 'info',
            title: ``,
            message: `You have imported ${importFilesArr.length} files successfully!`,
          })
        }

      }


    })

  }

  //functions of tabs
  const tabClick = (fileID) => {
    // set current active file
    setActiveFileID(fileID)
  }
  const tabClose = (id) => {
    //remove current id from openedFileIDs
    const tabsWithout = openedFileIDs.filter(fileID => fileID !== id)
    setOpenedFileIDs(tabsWithout)
    // set the active to the first opened tab if still tabs left
    if (tabsWithout.length > 0) {
      setActiveFileID(tabsWithout[0])
    } else {
      setActiveFileID('')
    }
  }
  


  //functions of todo lists
  const todoClick = (todoID) => {
    setActiveTodoID(todoID)
    if (!openedTodoIDs.includes(todoID)) {
      setOpenedTodoIDs([...openedTodoIDs, todoID])
    }

  }
  const deleteTodo = (id) => {
    if (todos[id].isNew) {
      const { [id]: todo, ...afterDelete } = todos
      setTodos(afterDelete)
    } else {
      fileHelper.deleteFile(todos[id].path).then(() => {
        delete todos[id]
        setTodos(todos)
        saveTodosToStore(todos)
        closeCard(id)
      })

    }

    // if (todos[id].isNew) {
    //   const { [id]: todo, ...afterDelete } = todos
    //   setTodos(afterDelete)
    // } else {
    //   fileHelper.deleteFile(todos[id].path).then(() => {
    //     const { [id]: todo, ...afterDelete } = todos
    //     setTodos(afterDelete)
    //     saveTodosToStore(afterDelete)
    //     closeCard(id)
    //   })
    // }
  }
  const updateTodo = (id, dueDate, todoEvent, importance, details, isNew) => {
    const newTodoPath = isNew ? join(savedTodoLocation, `${todoEvent}.log`) : join(dirname(todos[id].path), `${todoEvent}.log`)
    const modifiedTodo = { ...todos[id], dueDate: dueDate, todo: todoEvent, importance: importance, details: details, isNew: false, path: newTodoPath }
    const newTodos = { ...todos, [id]: modifiedTodo }
    if (isNew) {
      fileHelper.writeFile(newTodoPath, '').then(() => {
        setTodos(newTodos)
        saveTodosToStore(newTodos)
      })
    } else {
      const oldTodoPath = todos[id].path
      fileHelper.renameFile(oldTodoPath, newTodoPath).then(() => {
        setTodos(newTodos)
        saveTodosToStore(newTodos)
      })
    }


  }
  const createNewTodo = () => {
    const newTodoID = uuidv4()
    const newTodo = {
      id: newTodoID,
      dueDate: '',
      todo: '',
      importance: '',
      details: '',
      isNew: true,
    }
    setTodos({ ...todos, [newTodoID]: newTodo })
    //saveTodosToStore({ ...todos, [newTodoID]: newTodo })
  }

  //functions of cards
  const closeCard = (id) => {
    const cardsWithout = openedTodoIDs.filter(todoID => todoID !== id)
    setOpenedTodoIDs(cardsWithout)
    if (cardsWithout.length > 0) {
      setActiveTodoID(cardsWithout[0])
    } else {
      setActiveTodoID('')
    }

  }

  return (
    <div className="App container-fluid">
      <div className='row container-father'>
        <div className='col-1 tool-bar'>
          <ul className="nav nav-pills flex-column mt-5 " id="myTab" role="tablist">
            <li className="nav-item m-3" role="presentation">
              <button className="nav-link bar active " id="file-tab" data-bs-toggle="tab" data-bs-target="#file" type="button" role="tab" aria-controls="file" aria-selected="true">
                <FontAwesomeIcon
                  size="2x"
                  icon={faCopy} />
              </button>
            </li>
            <li className="nav-item m-3" role="presentation">
              <button className="nav-link bar" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">
                <FontAwesomeIcon
                  size="2x"
                  icon={faSearch} />
              </button>
            </li>
            <li className="nav-item m-3" role="presentation">
              <button className="nav-link bar" id="messages-tab" data-bs-toggle="tab" data-bs-target="#messages" type="button" role="tab" aria-controls="messages" aria-selected="false">
                <FontAwesomeIcon

                  size="2x"
                  icon={faDiagramSuccessor} />
              </button>
            </li>
            <li className="nav-item m-3" role="presentation">
              <button className="nav-link bar" id="todoLists-tab" data-bs-toggle="tab" data-bs-target="#todoLists" type="button" role="tab" aria-controls="todoLists" aria-selected="false">
                <FontAwesomeIcon
                  size="2x"
                  icon={faClipboardCheck} />
              </button>
            </li>
            <li className="nav-item m-3" role="presentation">
              <button className="nav-link bar" id="todoLists-tab" data-bs-toggle="tab" data-bs-target="#todoLists" type="button" role="tab" aria-controls="todoLists" aria-selected="false">
                <FontAwesomeIcon
                  size="2x"
                  icon={faUserCircle} />
              </button>
            </li>



          </ul>
        </div>
        <div className='col-3 left-panel'>
          <div className="tab-content row">
            <div className="tab-pane active" id="file" role="tabpanel" aria-labelledby="file-tab">
              <div className='row list-title d-flex align-items-center'>
                <span className=' col-8 text-center'><strong>File List</strong></span>
                <FontAwesomeIcon
                  className="col-2 p-0 c-link"
                  size="lg"
                  icon={faPlus}
                  onClick={createNewFile} />
                <FontAwesomeIcon
                  className="col-2 p-0 c-link"
                  size="lg"
                  icon={faFileImport}
                  onClick={importFiles} />

              </div>
              <FileList
                files={fileListArr}
                onFileClick={fileClick}
                onFileDelete={deleteFile}
                onSaveEdit={updateFileName}
              //onsaveEdit2={updateFileSort}

              />

            </div>
            <div className="tab-pane" id="profile" role="tabpanel" aria-labelledby="profile-tab">
              <FileSearch
                onFileSearch={fileSearch}
              />
              {/* <FileList
                files={fileListArr} //arr, render file list
                onFileClick={fileClick} //callback , identify which file was choosed 
                onFileDelete={deleteFile}//callback , identify which file was deleted 
                onSaveEdit={updateFileName}//callback , identify which file was changed 
              //onsaveEdit2={updateFileSort}

              /> */}

            </div>
            <div className="tab-pane" id="messages" role="tabpanel" aria-labelledby="messages-tab">
            </div>
            <div className="tab-pane" id="todoLists" role="tabpanel" aria-labelledby="todoLists-tab">
              <div className='row list-title d-flex align-items-center'>
                <span className=' col-10 text-center'><strong>Todo List</strong></span>
                <FontAwesomeIcon
                  className="col-2 p-0 c-link"
                  size="lg"
                  icon={faPlus}
                  onClick={createNewTodo}
                />

              </div>

              <TodoList
                todos={todoArr}
                onEventClick={todoClick}
                onEventDelete={deleteTodo}
                onSaveEvent={updateTodo}
              //</div>onSaveEvent={(id,newDate ) =>{console.log(id);console.log(newDate)}}
              >
              </TodoList>
              {
                !activeTodo &&
                <>
                  <div className="card text-center " hidden>
                  </div>

                </>
              }
              {
                activeTodo &&
                <>
                  <TodoCard
                    todos={openedTodos}
                    activeID={activeTodo}
                    onCloseCard={closeCard}>

                  </TodoCard>
                </>
              }

            </div>
          </div>
        </div>
        <div className='main col-8 right-panel p-0'>
          {
            !activeFile &&
            <div className="start-page">
              选择或者创建新的 Markdown 文档
            </div>
          }
          {
            activeFile &&
            <>

              <TabList
                files={openedFiles}
                activeId={activeFileID}
                unsaveIds={unsavedFileIDs}
                onTabClick={tabClick}
                onCloseTab={tabClose}

              />
              {/* <svg className='markmap'></svg> */}
              <SimpleMDE
                key={activeFile && activeFile.id}
                value={activeFile && activeFile.body}
                onChange={(value) => { fileChange(activeFile.id, value) }}
                options={{
                  autoDownloadFontAwesome: true,
                  autofocus: true,
                  forceSync: true,
                  previewImagesInEditor: true,
                  //lineNumbers: true,
                  minHeight: '600px',
                  uploadImage: true,
                  showIcons: ['strikethrough', 'code', 'table', 'redo', 'heading', 'undo', 'heading-bigger', 'heading-smaller', 'heading-1', 'heading-2', 'heading-3', 'clean-block', 'horizontal-rule'],
                }}
              ></SimpleMDE>
              <BottomBtn
                className="col"
                text="Save"
                colorClass="btn-outline-secondary"
                icon={faSave}
                onBtnClick={saveCurrentFile}
              />

              <BottomBtn
                className="col"
                text="Export Mindmap"
                colorClass="btn-outline-secondary"
                icon={faFileExport}
                onBtnClick={startCMD}
              />

            </>
          }
        </div>
      </div>

    </div>
  );
}

export default App;
