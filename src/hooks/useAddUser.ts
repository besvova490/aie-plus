import * as yup from "yup";
import useSWR from "swr";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

// helpers
import { useForm } from "./useForm";
import { SWR_KEYS } from "@/swr/swrKeys.constants";
import { ISingleUser } from "@/types/swr/IUsersList";
import { prepareUsersData } from "@/lib/prepareUsersData";

const validationSchema = yup.object().shape({
  subdivision: yup.string().required("Обов'язкове поле"),
  fullName: yup.string().required("Обов'язкове поле"),
  position: yup.string().required("Обов'язкове поле"),
  rank: yup.string().required("Обов'язкове поле"),
  place: yup.string().required("Обов'язкове поле"),
  speciality: yup.string().required("Обов'язкове поле"),
  vos: yup.string().required("Обов'язкове поле"),
  period: yup.object().shape({
    from: yup.string().required("Обов'язкове поле"),
    to: yup.string().required("Обов'язкове поле")
  }),
  order: yup.string().required("Обов'язкове поле"),
  orderNote: yup.string().required("Обов'язкове поле")
});

const INIT_VALUES = {
  subdivision: "",
  fullName: "",
  position: "",
  rank: "",
  place: "",
  speciality: "",
  vos: "",
  period: {
    from: "",
    to: ""
  },
  order: "",
  orderNote: ""
};

interface IUseAddUser {
  onSubmit: (data: ISingleUser) => void;
  value?: ISingleUser;
}

export function useAddUser(props: IUseAddUser) {
  const { onSubmit, value } = props;

  const { mutate } = useSWR(SWR_KEYS.USERS_LIST);

  const methods = useForm<ISingleUser>({
    defaultValues: INIT_VALUES as unknown as ISingleUser,
    validationSchema,
    onSubmit: async (data) => {
      const usersList = localStorage.getItem(SWR_KEYS.USERS_LIST);
      let updatedUsersList = usersList ? JSON.parse(usersList) : [];

      const payload = {
        id: uuidv4(),
        ...data,
        period: {
          from: dayjs(data.period.from).toString(),
          to: dayjs(data.period.to).toString()
        }
      } as ISingleUser;

      if (data.id) {
        updatedUsersList = updatedUsersList.map((user: ISingleUser) => {
          if (user.id === data.id) {
            return payload;
          }

          return user;
        });
      } else {
        updatedUsersList.unshift(payload);
      }

      localStorage.setItem(SWR_KEYS.USERS_LIST, JSON.stringify(updatedUsersList));
      prepareUsersData();
      mutate();

      onSubmit(data as ISingleUser);
    }
  });

  // effects
  useEffect(() => {
    if (value) {
      methods.reset(value);
    }
  }, [JSON.stringify(value)]);

  return methods;
}
