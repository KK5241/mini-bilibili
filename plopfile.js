export default plop => {
    plop.setGenerator('component', {
        // 描述
        description: 'create a component',
        // 询问组件的名称
        prompts: [{
            type: 'input',
            name: 'name',
            message: 'Your component name',
            default: 'MyComponent'
        }],
        // 获取到回答内容后续的动作
        actions: [
            //每一个对象都是一个动作
            {
                type: 'add', // 代表添加文件
                // 被创建文件的路径及名称
                // name 为用户输入的结果，使用 {{}} 使用变量
                // properCase: plop 自带方法，将 name 转换为大驼峰
                path: './src/components/{{ properCase name }}/index.vue',
                // 模板文件地址
                templateFile: 'plop-templates/component.vue.hbs'
            }
        ]
    })

    plop.setGenerator('view', {
        // 描述
        description: 'create a view',
        // 询问组件的名称
        prompts: [{
            type: 'input',
            name: 'name',
            message: 'Your view name',
            default: 'MyView'
        }],
        // 获取到回答内容后续的动作
        actions: [
            //每一个对象都是一个动作
            {
                type: 'add', // 代表添加文件
                // 被创建文件的路径及名称
                // name 为用户输入的结果，使用 {{}} 使用变量
                // properCase: plop 自带方法，将 name 转换为大驼峰
                path: './src/views/{{ properCase name }}/index.vue',
                // 模板文件地址
                templateFile: 'plop-templates/component.vue.hbs'
            }
        ]
    })
}