async function main() {
  await import('./generateTypesFromSchema').then(({ default: defaultFn }) => defaultFn());

  await import('./compileRouterConfig').then(({ default: defaultFn }) => defaultFn());

  await import('./compileRouterTypes').then(({ default: defaultFn }) => defaultFn());
}

main()
  .then(() => {
    console.log('Prebuild done');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
