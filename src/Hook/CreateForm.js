import React, { useState } from "react"
import { Button, Modal, Form, Input, Radio } from "antd"
const CollectionCreateForm=()=> {
    const [form] = Form.useForm();
    const [visible, setVisible] = useState(false);
    return (
      <div>
        <Modal
          title="创建一个新集合"
          visible={visible}
          okText="创建"
          cancelText="取消"
          onCancel={() => {
            setVisible(false);
          }}
          onOk={() => {
            form.validateFields().then((values) => {
                form.resetFields();
                console.log("验证成功,收到的表单值: ", values);
                setVisible(false);
              }).catch((errInfo) => {
                console.log("验证失败:", errInfo);
              });
          }}
        >
          <Form
            name="form_in_modal"
            layout="vertical"
            form={form}
            initialValues={{
              modifier: "public",
            }}
          >
            <Form.Item
              label="标题"
              name="title"
              rules={[
                {
                  required: true,
                  message: "请输入收藏的标题",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="描述" name="description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="modifier">
              <Radio.Group>
                <Radio value="public">公共的</Radio>
                <Radio value="private">私有的</Radio>
              </Radio.Group>
            </Form.Item>
          </Form>
        </Modal>
  
        <Button
          type="primary"
          onClick={() => {
            setVisible(true);
          }}
        >
          新窗口
        </Button>
      </div>
    );
  }

  export default CollectionCreateForm