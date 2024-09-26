export enum HowUse {
  create,
  update,
  show,
  remove,
  hide,
  dispatch,
  register,
}

export default function usage(type: HowUse) {
  let text = '';
  switch (type) {
    case HowUse.show:
      text = 'This component has been opened, if you want to update Component, proposal use EasyModal.update';
      break;

    case HowUse.create:
      text = 'Please pass in the react component.';
      break;

    case HowUse.update:
      text = `
        invalid Component or invalid customId!
        If you want to update Component , there are two aways:
        1. use EasyModal.create function create a EasyHOCComponents , and pass in EasyModal.update(/* EasyHOCComponents */)'
            then use EasyModal.update(Comp, willUpdateProps)
            
            example:

            const YourComp = EasyModal.create(Component)
            EasyModal.show(YourComp, props);
            EasyModal.update(YourComp, willUpdateProps);
            \n
        2. Please use EasyModal.show(Comp/* EasyModal.create or React Comp */, props, { id: /*here write customId*/ })
            then, use EasyModal.update(id /*pass above customId*/, willUpdateProps)

            example:

            const YourComp = EasyModal.create(Component)
            EasyModal.show(Component, props, { id: 'i am customId' });
            EasyModal.update('i am customId', willUpdateProps);

            `;
      break;

    case HowUse.dispatch:
      text = `
        No dispatch method detected, did you embed your app with EasyModal.Provider?

        example:

        <EasyModal.Provider>
          <App/>
        </EasyModal.Provider>
        `;
      break;
    case HowUse.register:
      text = `
        invalid id , please use valid string or valid number
    
        example:
  
        EasyModal.register('i am id',...)
        EasyModal.register(12345,...)
        `;
      break;
    default:
      break;
  }

  return text;
}
