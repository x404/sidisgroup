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
**How to update for Angular 16.2.12**

* ```nvm use v18```

* ```ng update @angular/core@16 @angular/cli@16```
* ```ng update @angular/material@16```

or update in manual mode the package.json file
