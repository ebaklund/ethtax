# ETHTAX

Hjelpeprogram for å generere skatteopplysinger for krypto beholdinger.

## Forberedelser
- Bygg
```
$ cd ./ethtax
$ nvm install 10.13
$ npm
```
- Konfigurer
```
$ cd ./ethtax
$ eval $(~/ethtax_env)

```
Nøkler ligger i filen `~/ethtax_env` for
  - IDEX_API_KEY
  - ETHERSCAN_API_KEY
  - COINMARKETCAP_API_KEY
  - COINBASE_API_KEY,
  - COINBASE_API_SECRET

Koper ligger i filen `Credentials` på minnepen.
Søk på stikkord `ethtax` i filen `Credentials`.

## Start
```
$ node . <YYYY>
```
der YYYY er skatteåret som opplysningene gjelder for.

## Utfordringer
Programmet benytter seg av flere nettverksresurser.
Problemet der er at endepunkter og API'er endrer seg år for år.
Dette medfører at det må påregnes oppdatering av denne koden for hvert år.
Dessuten er det ikke aller resurser som har API tiljengelig.
Her må opplysinger hentes manuellt.

## Kildemateriale
- Kurser
  - Norges bank
  - cryptocompare
- Beholding og transaksjoner
  - coinbase
  - idex - ustabil, ikke implmentert
  - nahmii 1
  - nahmii 2 - ikke implementert
  - etherscan
  - hitbtc ???