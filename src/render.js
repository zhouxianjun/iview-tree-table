export default {
    name: 'render',
    functional: true,
    props: {
        params: Object,
        render: Function
    },
    render: (h, ctx) => {
        return ctx.props.render(h, ctx.props.params);
    }
};
