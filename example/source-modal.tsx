import React, {useEffect, useState} from "react"
import {Modal, Divider, Button, Input, Upload, message} from "antd"
import {useLabelImg} from "./label-img-provider"
import {useStore} from "./store-provider"
import {Points} from "src/structure"
import {TaskInfo} from "src/TaskInfo";
import queryString from 'query-string';

const blackDogs = [
    [[620, 244], [799, 244], [799, 441], [620, 441]],
    [[265, 26], [420, 26], [420, 436], [265, 436]]
] as Points[]
const dogEar = [
    [[559, 116], [554, 125], [547, 135], [542, 151], [532, 166], [535, 180], [539, 189], [546, 189], [558, 183], [566, 175], [574, 170], [579, 166], [582, 159], [581, 152], [576, 146], [570, 134], [567, 126], [563, 118]]
] as Points[]

const SourceModal = () => {
    const [visible, setVisible] = useState(true)
    const [url, setUrl] = useState("")
    const [localPath, setLocalPath] = useState("")
    const [lb] = useLabelImg()
    const [_, setStore] = useStore()

    // useEffect(() => {
    //   if(!lb) return
    //   lb.register("polygon", {
    //     type: "Polygon",
    //     style: {
    //       normal: {
    //         lineColor: "black",
    //         opacity: .05
    //       }
    //     },
    //     tag: "多边形",
    //   })
    //   lb.register("rect", {
    //     type: "Rect",
    //     tag: "矩形"
    //   })
    // }, [lb])

    const close = () => {
        if (!lb) return
        const list = lb.getShapeList()
        const labelTypes = lb.getLabels()
        setStore({
            list,
            labelTypes
        })
        setVisible(false)
    }

    const addTask = () => {
        if (!lb) return
        const typeList = ['car', 'bike'];
        typeList.forEach(item => {
            lb.register(item, {
                type: "Rect",
                tag: item
            })
        })
        const baseUrl = 'http://127.0.0.1:8877/api'
        fetch(`${baseUrl}/getList?path=${localPath}`).then(response => response.json())
            .then(res => {
                if (!res.dataset || res.dataset.length == 0) {
                    message.warn('本地路径未找到!')
                    return;
                }
                let taskInfo = new TaskInfo(localPath);
                taskInfo.taskCount = res.dataset.length
                lb.setTaskInfo(taskInfo);
                lb.load(`${baseUrl}/image?src=` + res.dataset[0]).then(() => {
                    close()
                })
                let index = 0;
                lb.registerDrawFinish((path: string, data: any) => {
                    let parseUrl = queryString.parseUrl(path)
                    let filePath = parseUrl.query.src
                    let nameIndex = filePath?.lastIndexOf('/') || 0
                    let fileName = filePath?.slice(nameIndex + 1)
                    let filePrefix = fileName?.slice(0, fileName.lastIndexOf('.'));
                    // 默认保存在项目目录 annotations 文件夹下
                    let outFile = `${taskInfo.rootPath}/annotations/${filePrefix}.xml`
                    console.log(fileName, filePrefix, outFile)
                    const formData = new URLSearchParams();
                    formData.append("filePath", outFile);
                    formData.append("vocContent", data);
                    fetch(`${baseUrl}/voc`, {
                        method: 'post',
                        body: formData,
                    }).then(response => response.json()).then(res=> {
                        console.log(res)
                    })
                    lb.load(`${baseUrl}/image?src=` + res.dataset[++index]).then(() => {
                        close()
                    })
                })
            })
    }

    const loadData = () => {
        if (!lb) return
        lb.register("black-dog", {
            type: "Rect",
            tag: "black dog"
        })
        lb.register("dog-ear", {
            type: "Polygon",
            tag: "狗耳朵",
            style: {
                normal: {
                    lineColor: "aqua",
                    fillColor: "blueviolet",
                    dotColor: "burlywood"
                }
            }
        })
        lb.load("./dog.jpg").then(() => {
            blackDogs.forEach((positions) => {
                const shape = lb.createShape("black-dog", {
                    positions
                })
                lb.addShape(shape)
            })
            dogEar.forEach((positions) => {
                const shape = lb.createShape("dog-ear", {
                    positions
                })
                lb.addShape(shape)
            })
            close()
        })
    }

    const lodaByUrl = () => {
        if (!url || !lb) return
        lb.load(url).then(() => {
            close()
        })
    }

    return (
        <Modal
            title="选择数据源"
            visible={visible}
            footer={false}
            closable={false}
            centered
        >
            <div>
                <Upload accept="image/*" style={{
                    width: "100%"
                }} className="w-full block"
                        onChange={({file}) => {
                            console.log(file.originFileObj)
                            lb?.load(file.originFileObj as any, file.name)
                            close()
                        }}
                        action={""}
                >
                    <Button type="primary" block>上传本地图片</Button>
                </Upload>
            </div>
            <Divider/>
            <div>
                <Input value={url} onChange={(e) => {
                    setUrl(e.target.value)
                }} style={{
                    marginBottom: 8
                }} placeholder="请输入图片地址"/>
                <Button type="primary" block onClick={lodaByUrl}>加载线上图片</Button>
            </div>
            <Divider/>
            <div>
                <Button type="primary" block onClick={loadData}>
                    加载示例数据
                </Button>
            </div>
            <Divider/>
            <div>
                <Input placeholder="输入本地路径" value={localPath} onChange={(e) => {
                    setLocalPath(e.target.value)
                }} style={{
                    marginBottom: 8
                }} />
                <Button type="primary" block onClick={addTask}>
                    打开本地标注任务
                </Button>
            </div>
        </Modal>
    )
}

export default SourceModal
