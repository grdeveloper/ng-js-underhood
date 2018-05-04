const directive = (name, controller) => {
    document
        .querySelectorAll('[' + name + ']')
        .forEach(elem => controller(elem, elem.attributes[name].value));
};

const evalInScope = (exp, scope) => eval(
    Object
        .keys(scope)
        .map(name => `var ${ name } = ${ JSON.stringify(scope[name]) }`)
        .concat(exp)
        .join(';')
);

const scope = {};
const watches = [];

const $digest = () => {
    console.log(scope);
    watches.forEach(watch => {
        const {exp, cb, last} = watch;
        const curr = evalInScope(exp, scope);

        if (curr !== last) {
            cb();
            watch.last = curr;
        }
    });
};

const $watch = (exp, cb) => {
    watches.push({exp, cb, last: evalInScope(exp, scope)});
};

directive('ng-model', (elem, key) => {
    const update = () => {
        scope[key] = elem.value || '';
        $digest();
    };

    elem.oninput = update;

    update();

    $watch(key, () => elem.value = scope[key]);
});

directive('ng-bind', (elem, exp) => {
    const update = () => elem.innerText = evalInScope(exp, scope);

    $watch(exp, update);

    update();
});

directive('ng-show', (elem, exp) => {
    $watch(exp, () => {
        elem.style.display = evalInScope(exp, scope) ? 'inherit' : 'none';
    });
});

$watch('age', () => console.log('Age is ' + scope.age));
$watch('gender', () => console.log('Gender is ' + scope.gender));