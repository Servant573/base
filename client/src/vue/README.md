# Vue

## Вопрос 1 (разогревочный)
В чём основные отличия Vue 3 от Vue 2? Назови минимум 4 ключевых изменения, которые влияют на повседневную разработку.

1) Vue3 легко типизируется. Удобно. Сейчас везде используется typescript.
2) Vue3 c composition api стал более лаконичным, появилась возможность вынести и переиспользовать логику связанную с компонентами vue
3) Vue3 c composition api стал более React подобным, это плюс
4) В template появилось больше свободы для использования js внутри хотя бы {{ }}. Также появилось много синтаксического сахара, который делает всё проще и чище.

## Вопрос 2
Объясни, как работает система реактивности в Vue 3. Что происходит под капотом, когда ты создаёшь ref() или reactive()? В чём разница между ними?

ref это что-то наподобие js proxy. Внутри этой сущности есть set и get с помощью которых можно "реактивно" отслеживать изменения. Ref работает глубоко, если есть вложенность то она становится reactive
Также и работает reactive - правда он работает только с объектами и имеет свои ограничения. Например: не работает с примитивами, нельзя обновить объект целиком так как теряется ссылка, ну и деструктуризация лишает реактивности переменные

## Вопрос 3
Расскажи про Composition API. В каких случаях ты предпочитаешь его Options API, а в каких — наоборот? Приведи пример рефакторинга компонента с Options API на Composition API.

Composition API использует более функциональный подход что ли. Насколько я понимаю, внутри Options API используется Composition API.
Лично я предпочитаю во всех случаях использовать один и тот же подход, чтобы в проекте не было "каши". Преимущественно конечно Composition API.

```vue 

<template>
  <CustomDropbox
    :placeholder="getLangText('requests.form.name')"
    :label="getLangText('requests.form.name')"
    :clear-button="clearButton"
    :size
    :required
    :valid
    :text-param="'value'"
    :value-param="'data'"
    :items="items"
    :value="modelValue"
    :point
    @clear="onClear"
    @input="setValue"
    @search="onInput"
  >
    <template #item="{ item: { value, data } }">
      <div>
        <div>{{ value }}</div>
        <div class="areal-text-t4 gray--text">
          ОКПО: {{ data.okpo }}
        </div>
      </div>
    </template>
  </CustomDropbox>
</template>

<script>
import { debounce } from '@areal/utils';
import { searchCompanyFromDaData } from '@/modules/requests/form/services';

export default {
  name: 'DaDataSearchInput',
  props: {
    size: {
      type: String,
      default: 'M',
    },
    point: {
      type: String,
      default: '',
    },
    valid: {
      type: Boolean,
      default: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    clearButton: {
      type: Boolean,
      default: false,
    },

    /**
     * {
     *   value: '',
     *   data: { okpo: '', address: '' },
     *  }
     * */
    value: {
      type: Object,
      default: undefined,
    },
  },
  data() {
    return {
      modelValue: this.value,
      items: [],
    };
  },
  watch: {
    value(val) {
      this.modelValue = val;
    },
    modelValue(val) {
      this.$emit('update:modelValue', val);
    },
  },
  created() {
    this.debouncedSearch = debounce(this.searchItems, 300);

    if (this.value?.value) {
      this.items = [this.value];
    } else {
      this.searchItems();
    }
  },
  methods: {
    setValue(value) {
      this.modelValue = value;
    },
    onClear() {
      this.modelValue = null;
      this.$emit('clear');
    },

    onInput(search) {
      if (this.modelValue) {
        if (search.length > 0 && search !== this.modelValue.value) {
          this.debouncedSearch(search);
        }
        return;
      }
      this.debouncedSearch(search);
    },

    async searchItems(search) {
      const params = {};
      if (search) params.query = search;

      const [data, error] = await searchCompanyFromDaData(params);
      if (data?.suggestions) {
        this.items = data.suggestions;
      } else {
        this.$emit('error', error);
      }
    },
  },
};
</script>

```

```vue

<template>
  <CustomDropbox
    :placeholder="getLangText('requests.form.name')"
    :label="getLangText('requests.form.name')"
    :clear-button="clearButton"
    :size
    :required
    :valid
    :text-param="'value'"
    :value-param="'data'"
    :items="items"
    :value="modelValue"
    :point
    @clear="onClear"
    @input="setValue"
    @search="onInput"
  >
    <template #item="{ item: { value, data } }">
      <div>
        <div>{{ value }}</div>
        <div class="areal-text-t4 gray--text">
          ОКПО: {{ data.okpo }}
        </div>
      </div>
    </template>
  </CustomDropbox>
</template>

<script setup>

import { onMounted, ref, watchEffect } from 'vue';
import { debounce } from '@areal/utils';
import { searchCompanyFromDaData } from '@/modules/requests/form/services';

const props = defineProps({
  size: {
    type: String,
    default: 'M',
  },
  point: {
    type: String,
    default: '',
  },
  valid: {
    type: Boolean,
    default: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  clearButton: {
    type: Boolean,
    default: false,
  },
  value: {
    type: Object,
    default: undefined,
  },
});

const emit = defineEmits(['error']);

const modelValue = defineModel(props.value);

const items = ref([]);

const setValue = (value) => {
  modelValue.value = value;
};

const onClear = () => {
  modelValue.value = null;
  emit('clear');
};

const searchItems = async (search) => {
  const params = {};
  if (search) params.query = search;

  const [data, error] = await searchCompanyFromDaData(params);
  if (data?.suggestions) {
    items.value = data.suggestions;
  } else {
    emit('error', error);
  }
};

const debouncedSearch = debounce(searchItems, 300);

const onInput = (search) => {
  if (modelValue.value) {
    if (search.length > 0 && search !== modelValue.value.value) {
      debouncedSearch(search);
    }
    return;
  }
  debouncedSearch(search);
};

onMounted(() => {
  if (props.value?.value) {
    items.value = [props.value];
  } else {
    searchItems();
  }
});

watchEffect(() => {
  modelValue.value = props.value;
});

</script>

```


## Вопрос 4
Что такое setup() и в каком порядке выполняются lifecycle hooks внутри него по сравнению с Options API? Может ли setup() быть async? Если да, то как это влияет на рендеринг компонента?

setup() это хук, точка использования composition api.

lifecycle:

- setup
- beforeCreate
- created
- инициализация Options API
- beforeMount
- mounted
- beforeUpdated
- updated
- beforeUnmount
- unmounted

Да, setup может быть async. Компонент будет отрендерится по мере резолва ансинхронщины внутри

## Вопрос 5
Как правильно типизировать props и emits в Vue 3 с TypeScript? Приведи пример компонента с пропсом-объектом и кастомным событием.

```vue 
<template>
  <div>
    <div
      v-for="(
        { cargo, packageData, numberOfPlaces, grossWeight, id }, index
      ) in cargoList"
      :key="id"
      :class="{ 'mb-5': mobile }"
    >
      <request-cargo-inputs-block
        :index="index"
        :directory-type="directoryType"
        :id="id"
        :cargo="cargo"
        :package-data="packageData"
        :number-of-places="numberOfPlaces"
        :gross-weight="grossWeight"
        :mobile="mobile"
        @remove="removeCargo(id)"
        @update:model-value="updateCargo"
      />
    </div>
    <areal-link
      icon="areal:plus"
      to=""
      button
      :label="t('addCargo')"
      class="mt-2"
      @click="addCargo"
    />
  </div>
</template>

<script setup lang="ts">
import { ArealLink } from '@areal/components-quasar'
import { RequestCargoInputsBlock } from '@/modules/clearance/modules/requests/components'
import { ref } from 'vue'
import { CargoBlockInputsInterface } from '@/modules/clearance/modules/requests/interfaces/cargo-block-inputs.interface'
import { CargoEncodingType } from '@/modules/clearance/modules/requests/types/cargo-encoding.type'
import { useI18n } from 'vue-i18n'
import messages from '@/modules/clearance/modules/requests/components/requests-form/messages'

const { t } = useI18n({ messages })

const emit =
  defineEmits<
    (e: 'update:model-value', value: CargoBlockInputsInterface[]) => void
  >()

const props = defineProps<{
  directoryType: CargoEncodingType
  modelValue: CargoBlockInputsInterface[]
  mobile: boolean
}>()

const cargoList = ref<CargoBlockInputsInterface[]>(props.modelValue)

const updateModelValue = (list: CargoBlockInputsInterface[]) => {
  emit('update:model-value', list)
}

const addCargo = () => {
  cargoList.value.push({
    id: new Date().getMilliseconds(),
    cargo: null,
    packageData: null,
    numberOfPlaces: null,
    grossWeight: null,
  })
  updateModelValue(cargoList.value)
}

const removeCargo = (id: number) => {
  cargoList.value = cargoList.value.filter((it) => it.id !== id)
  updateModelValue(cargoList.value)
}

const updateCargo = (value: CargoBlockInputsInterface) => {
  const index = cargoList.value.findIndex((it) => it.id === value.id)
  if (index !== -1) {
    cargoList.value[index] = value
  }
  updateModelValue(cargoList.value)
}
</script>

```

## Вопрос 6 (практический)
Представь, что у тебя есть большой список из 10 000 элементов. Как ты оптимизируешь его рендеринг в Vue 3, чтобы избежать лагов? Назови все возможные подходы.

1) Виртуализация больших списков
   vue-virtual-scroller
   vue-virtual-scroll-grid
   vueuc/VVirtualList

2) Отказаться от глубокой реактивности, используя shallowRef() и shallowReactive()

3) Избегайте ненужных компонентных абстракций (компоненты высокого порядка, которые рендерят другие компоненты)

## Вопрос 7 (глубокий)
Что происходит, если ты мутируешь объект, переданный через prop? Почему это считается антипаттерном? Как правильно передавать сложные данные из родителя в ребёнка и обратно?

Если так делать, то получается мы из дочернего компонента меняем свойства родительского напрямую. Это очень плохо. Можно реализовать изменение через emit, пробросить функцию для изменения состояния ну или что-нибудь ещё

## Вопрос 8
Объясни разницу между watch и watchEffect. В каких ситуациях ты используешь каждый из них? Может ли watchEffect вызвать бесконечный цикл и как этого избежать?

Для watch нужно указывать за чем ему конкретно нужно следить.
watchEffect типо лаконичнее, еси уже внутри него ты работаешь с реактивностью, то он и смотрит за изменением этой реактивности
Бесконечный цикл возможен, если внутри watchEffect мы мутируем реактивное свойство

## Вопрос 9
Что такое Teleport и Suspense? Приведи реальный пример использования каждого.

Teleport нужен для вывода компонента вне своей иерархии. Это удобно например для модального окна.
Suspense экспериментальная обертка для управления асинхронными компонентами. Напоминает в JS Promise.all(). Мы можем повесить состояние загрузки на несколько асинхронных компонентов например
## Вопрос 10 (архитектурный)
Как ты организуешь state management в большом Vue 3 приложении? Почему Pinia предпочтительнее Vuex 5? Как ты типизируешь Pinia stores с TypeScript?

Ну state management я бы вынес в отдельную директорию, внутри которой бы были отдельные директории под каждый смысловой модуль в приложении. Использовал бы Pinia.
1) Разрабы vue сами же её и советуют. Ну а кто я такой?)
2) Pinia очень простая для понимания и использует composition Api
3) Pinia приятно типизируется
4) Стильно, модно, современно

```ts

import { defineStore } from 'pinia'
import { fetchProfile, fetchUserOrganizations } from '@/shared/api/users'
import { ProfileInterface } from '@/shared/interfaces/users/profile.interface'
import { OrganizationInterface } from '@/shared/interfaces/users/organization.interface'
import { fetchManagers } from '@/layouts/default-layout/api'
import { ManagerInterface } from '@/shared/interfaces/users/manager.interface'
import { useLocalStorage } from '@vueuse/core'

interface AppStoreInterface {
  profile: ProfileInterface | null
  organizations: OrganizationInterface[]
  currentOrganization: OrganizationInterface | null
  managers: ManagerInterface[]
}

export const useUsersStore = defineStore('usersStore', {
  state: (): AppStoreInterface => {
    return {
      profile: null,
      organizations: [],
      currentOrganization: null,
      managers: [],
    }
  },
  actions: {
    async getProfile() {
      const [data] = await fetchProfile()
      if (data) {
        this.setProfile(data.mainInfo)
      }
    },
    async getOrganizations() {
      const [data] = await fetchUserOrganizations()
      if (data) {
        this.setOrganizations(data)
      }
    },
    async getManagers() {
      if (this.currentOrganization) {
        const [data] = await fetchManagers(this.currentOrganization.id)
        if (data) {
          this.managers = data
        }
      }
    },
    setProfile(profile: ProfileInterface) {
      this.profile = profile
    },
    setOrganizations(organizations: OrganizationInterface[]) {
      this.organizations = organizations
      const currOrg = useLocalStorage<string | null>('currentOrg', null)
      if (currOrg.value) {
        const org = this.organizations.find(
          (it) => it.externalId === currOrg.value,
        )
        if (org) {
          this.currentOrganization = org
          return
        }
      }
      if (this.organizations[0]) {
        this.setCurrentOrganization(this.organizations[0])
      }
    },
    setCurrentOrganization(organization: OrganizationInterface) {
      if (this.currentOrganization?.externalId !== organization.externalId) {
        localStorage.setItem('currentOrg', organization.externalId ?? '')
        this.currentOrganization = organization
      }
    },
  },
  getters: {
    getUser(state: AppStoreInterface) {
      const { fio, avatar } = state.profile ?? {}
      const [firstName, lastName] = (fio ?? '').split(' ')
      const firstLiteral = firstName ? (firstName[0] ?? '') : ''
      const lastLiteral = lastName ? (lastName[0] ?? '') : ''
      const textAvatar = `${firstLiteral}${lastLiteral}`
      return {
        lastName,
        firstName,
        textUser: `${firstName ?? ''} ${lastName ?? ''}`,
        textAvatar,
        avatar,
      }
    },
    getOwnOrganizations(state: AppStoreInterface) {
      return state.organizations
    },
    getCurrentOrganization(state: AppStoreInterface) {
      return state.currentOrganization
    },
    getCurrentManagers(state: AppStoreInterface) {
      return state.managers
    },
  },
})

```
