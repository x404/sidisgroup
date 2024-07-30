Test. Angular.

[https://sidis.group/](https://sidis.group/)


Реалізуйте таблицю і реактивну форму для створення - редагування Product.  Продукт може мати безліч додаткових полів в полі fields.
Колонка Field це звичайний input для вводу name.
Колонка Value може змінювати input на datepicker в залежності від стану чекбоксу.

При вибраному expiration_type: expirable expiration_date з'являється і являється required.
Якщо expiration_type: unexpirable поле зникає.

https://139-162-155-38.ip.linodeusercontent.com:4444/api/v1/schema/swagger-ui/



Result: [https://x404.github.io/sidisgroup/](https://x404.github.io/sidisgroup/)


ps.
```ng deploy --base-href=https://x404.github.io/sidisgroup/```

---
**How to update to Angular 17.3.0**

* ```nvm use v20.10.0```

* ```ng update @angular/core@17 @angular/cli@17```
* ```ng update @angular/material@17```

or update in manual mode the package.json file

```nvm use `cat .nvmrc````


References:

* [https://angular.dev/reference/versions](https://angular.dev/reference/versions)
* [https://www.npmjs.com/package/@angular/cli?activeTab=versions](https://www.npmjs.com/package/@angular/cli?activeTab=versions)
* [https://www.devxperiences.com/pzwp1/2024/01/13/angular-create-a-project-with-any-version/](https://www.devxperiences.com/pzwp1/2024/01/13/angular-create-a-project-with-any-version/)
* [https://medium.com/ng-gotchas/easily-create-the-legacy-angular-apps-v2-v4-v5-v6-ee4a22d7eb60](https://medium.com/ng-gotchas/easily-create-the-legacy-angular-apps-v2-v4-v5-v6-ee4a22d7eb60)
* [https://www.npmjs.com/package/@angular/material?activeTab=versions](https://www.npmjs.com/package/@angular/material?activeTab=versions)
* [https://v17.angular.io/guide/standalone-migration](https://v17.angular.io/guide/standalone-migration)

